// Edge Function `unlock` — einzige Schreibstelle für `unlocks` (Projektplan §9/§10).
// Der Client liefert Position + Genauigkeit; die Freischalt-Entscheidung fällt hier.
// AP9-Härtung: Body-Limit, Rate Limit (10 Versuche/h), Plausibilitäts-Flagging.
import { createClient } from 'npm:@supabase/supabase-js@2';

type UnlockRequest = {
  placeId?: unknown;
  lat?: unknown;
  lng?: unknown;
  accuracy?: unknown;
  isMocked?: unknown;
};

const MAX_ACCURACY_M = 100; // §9: keine Freischaltung bei accuracy > 100 m
const ACCURACY_BONUS_CAP_M = 50; // §9: distance <= radius + min(accuracy, 50)
const MAX_BODY_BYTES = 2048; // AP9: kleines, festes Limit für den JSON-Body
const RATE_LIMIT_ATTEMPTS = 10; // §10: max. Versuche pro Stunde und Nutzer
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const PLAUSIBLE_SPEED_MPS = 70; // ~250 km/h — darüber wird geflaggt (A-AP9-3)

/** Haversine-Distanz in Metern (WGS84, mittlerer Erdradius). */
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function business(code: string, extra: Record<string, unknown> = {}) {
  return Response.json({ ok: code === 'UNLOCKED' || code === 'ALREADY_UNLOCKED', code, ...extra });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, code: 'METHOD_NOT_ALLOWED' }, { status: 405 });
  }

  // Auth: gültige (auch anonyme) Supabase-Session erforderlich
  const authHeader = req.headers.get('Authorization') ?? '';
  const anonClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const {
    data: { user },
    error: userError,
  } = await anonClient.auth.getUser();
  if (userError || !user) {
    return Response.json({ ok: false, code: 'UNAUTHORIZED' }, { status: 401 });
  }

  // AP9: Body-Größe begrenzen, bevor geparst wird
  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, code: 'BODY_TOO_LARGE' }, { status: 413 });
  }
  let body: UnlockRequest;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: false, code: 'INVALID_BODY' }, { status: 400 });
  }

  const { placeId, lat, lng, accuracy, isMocked } = body;
  if (
    typeof placeId !== 'string' ||
    placeId.length === 0 ||
    placeId.length > 64 ||
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    typeof accuracy !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(accuracy) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180 ||
    accuracy < 0 ||
    accuracy > 100000 ||
    (isMocked !== undefined && typeof isMocked !== 'boolean')
  ) {
    return Response.json({ ok: false, code: 'INVALID_INPUT' }, { status: 400 });
  }

  // Service Role früh, da Rate Limit vor allen Business-Checks greift
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // AP9: Rate Limit — zählt jeden validierten Versuch (§10)
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count: attempts, error: attemptsError } = await serviceClient
    .from('unlock_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('attempted_at', windowStart);
  if (attemptsError) {
    console.error('unlock: attempts query failed', attemptsError);
    return Response.json({ ok: false, code: 'INTERNAL' }, { status: 500 });
  }
  if ((attempts ?? 0) >= RATE_LIMIT_ATTEMPTS) {
    return Response.json({ ok: false, code: 'RATE_LIMITED' }, { status: 429 });
  }
  await serviceClient.from('unlock_attempts').insert({ user_id: user.id, place_id: placeId });

  if (isMocked === true) {
    console.warn(`unlock: mock location flagged, user=${user.id} place=${placeId}`);
    return business('MOCK_LOCATION');
  }
  if (accuracy > MAX_ACCURACY_M) {
    return business('ACCURACY_TOO_LOW', { accuracyM: Math.round(accuracy) });
  }

  const { data: place, error: placeError } = await serviceClient
    .from('places')
    .select('id, lat, lng, unlock_radius_m, active')
    .eq('id', placeId)
    .maybeSingle();
  if (placeError) {
    console.error('unlock: place query failed', placeError);
    return Response.json({ ok: false, code: 'INTERNAL' }, { status: 500 });
  }
  if (!place || !place.active) {
    return business('UNKNOWN_PLACE');
  }

  // Idempotenz: bereits freigeschaltet?
  const { data: existing, error: existingError } = await serviceClient
    .from('unlocks')
    .select('unlocked_at')
    .eq('user_id', user.id)
    .eq('place_id', place.id)
    .maybeSingle();
  if (existingError) {
    console.error('unlock: existing query failed', existingError);
    return Response.json({ ok: false, code: 'INTERNAL' }, { status: 500 });
  }
  if (existing) {
    return business('ALREADY_UNLOCKED', { unlockedAt: existing.unlocked_at });
  }

  // AP9: Plausibilitäts-Flagging — Tempo seit dem letzten Unlock (loggen, nicht blocken; A-AP9-3)
  const { data: lastUnlock } = await serviceClient
    .from('unlocks')
    .select('lat, lng, unlocked_at')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastUnlock) {
    const elapsedS = (Date.now() - new Date(lastUnlock.unlocked_at).getTime()) / 1000;
    if (elapsedS > 0) {
      const travelledM = haversineM(lastUnlock.lat, lastUnlock.lng, lat, lng);
      const speed = travelledM / elapsedS;
      if (speed > PLAUSIBLE_SPEED_MPS) {
        console.warn(
          `unlock: implausible speed flagged, user=${user.id} place=${placeId} speed=${Math.round(speed)}m/s`,
        );
      }
    }
  }

  const distanceM = haversineM(lat, lng, place.lat, place.lng);
  const allowedM = place.unlock_radius_m + Math.min(accuracy, ACCURACY_BONUS_CAP_M);
  if (distanceM > allowedM) {
    return business('TOO_FAR', { distanceM: Math.round(distanceM) });
  }

  const { data: inserted, error: insertError } = await serviceClient
    .from('unlocks')
    .insert({
      user_id: user.id,
      place_id: place.id,
      lat,
      lng,
      accuracy_m: accuracy,
      distance_m: Math.round(distanceM * 100) / 100,
    })
    .select('unlocked_at')
    .single();
  if (insertError) {
    // Race: paralleler Unlock desselben Nutzers → idempotent behandeln
    if (insertError.code === '23505') {
      const { data: raced } = await serviceClient
        .from('unlocks')
        .select('unlocked_at')
        .eq('user_id', user.id)
        .eq('place_id', place.id)
        .maybeSingle();
      return business('ALREADY_UNLOCKED', { unlockedAt: raced?.unlocked_at });
    }
    console.error('unlock: insert failed', insertError);
    return Response.json({ ok: false, code: 'INTERNAL' }, { status: 500 });
  }

  return business('UNLOCKED', {
    distanceM: Math.round(distanceM),
    unlockedAt: inserted.unlocked_at,
  });
});
