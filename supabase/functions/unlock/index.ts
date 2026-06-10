// Edge Function `unlock` — einzige Schreibstelle für `unlocks` (Projektplan §9/§10).
// Der Client liefert Position + Genauigkeit; die Freischalt-Entscheidung fällt hier.
// Rate Limiting & Plausibilitäts-Flagging folgen in AP9 (A-AP6-1).
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

  let body: UnlockRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, code: 'INVALID_BODY' }, { status: 400 });
  }

  const { placeId, lat, lng, accuracy, isMocked } = body;
  if (
    typeof placeId !== 'string' ||
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    typeof accuracy !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(accuracy) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180 ||
    accuracy < 0 ||
    accuracy > 100000
  ) {
    return Response.json({ ok: false, code: 'INVALID_INPUT' }, { status: 400 });
  }

  if (isMocked === true) {
    console.warn(`unlock: mock location flagged, user=${user.id} place=${placeId}`);
    return business('MOCK_LOCATION');
  }
  if (accuracy > MAX_ACCURACY_M) {
    return business('ACCURACY_TOO_LOW', { accuracyM: Math.round(accuracy) });
  }

  // Service Role: liest places vollständig und schreibt unlocks (RLS-Bypass nur hier)
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

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
      return business('ALREADY_UNLOCKED');
    }
    console.error('unlock: insert failed', insertError);
    return Response.json({ ok: false, code: 'INTERNAL' }, { status: 500 });
  }

  return business('UNLOCKED', {
    distanceM: Math.round(distanceM),
    unlockedAt: inserted.unlocked_at,
  });
});
