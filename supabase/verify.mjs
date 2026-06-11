/**
 * Backend-Abnahme (AP3 + AP6): prüft Schema, RLS-Wirkung und die Edge Function
 * `unlock` aus Client-Sicht. Nutzt ausschließlich URL + Anon-Key (wie die App).
 *   node supabase/verify.mjs   (liest .env im Repo-Root oder Umgebungsvariablen)
 * Hinweis: erzeugt einen echten Unlock für einen Wegwerf-Anon-Nutzer (A-AP6-4).
 */
import { readFileSync } from 'node:fs';

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  } catch {
    /* keine .env — nur Umgebungsvariablen */
  }
  return env;
}

const env = loadEnv();
const URL_ = env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!URL_ || !KEY) {
  console.error('EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY fehlen.');
  process.exit(2);
}

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// 1) Orte lesbar (anon, ohne Login)
const placesRes = await fetch(`${URL_}/rest/v1/places?select=id,name,lat,lng,unlock_radius_m,active`, { headers });
const places = placesRes.ok ? await placesRes.json() : null;
check('places lesbar (anon)', placesRes.ok, `HTTP ${placesRes.status}`);
check('8 aktive Orte im Seed', Array.isArray(places) && places.length === 8, `gefunden: ${places?.length ?? '—'}`);

// 2) unlocks: Insert ohne Login muss scheitern
const insAnon = await fetch(`${URL_}/rest/v1/unlocks`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ place_id: 'zugspitze', lat: 0, lng: 0, accuracy_m: 1, distance_m: 1, user_id: '00000000-0000-0000-0000-000000000000' }),
});
check('unlocks-Insert ohne Login abgelehnt', insAnon.status === 401 || insAnon.status === 403, `HTTP ${insAnon.status}`);

// 3) Anonyme Anmeldung (Supabase Anonymous Auth)
const signRes = await fetch(`${URL_}/auth/v1/signup`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
});
const session = signRes.ok ? await signRes.json() : null;
check('anonyme Anmeldung möglich', signRes.ok && !!session?.access_token, `HTTP ${signRes.status}`);

if (session?.access_token) {
  const userHeaders = { apikey: KEY, Authorization: `Bearer ${session.access_token}` };

  // 4) unlocks: Insert als eingeloggter Client muss an RLS scheitern
  const insUser = await fetch(`${URL_}/rest/v1/unlocks`, {
    method: 'POST',
    headers: { ...userHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: session.user.id, place_id: 'zugspitze', lat: 47.4211, lng: 10.9863, accuracy_m: 5, distance_m: 1 }),
  });
  check('unlocks-Insert als Client abgelehnt (RLS)', insUser.status === 401 || insUser.status === 403, `HTTP ${insUser.status}`);

  // 5) unlocks: eigene Liste lesbar und leer
  const own = await fetch(`${URL_}/rest/v1/unlocks?select=place_id`, { headers: userHeaders });
  const ownRows = own.ok ? await own.json() : null;
  check('eigene unlocks lesbar (leer)', own.ok && Array.isArray(ownRows) && ownRows.length === 0, `HTTP ${own.status}, rows: ${ownRows?.length ?? '—'}`);

  // ---------- AP6: Edge Function `unlock` ----------
  const callUnlock = async (body, token = session.access_token) =>
    fetch(`${URL_}/functions/v1/unlock`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  const json = async (res) => (res.ok ? res.json() : null);

  // 6) Ohne gültiges JWT → 401
  const noAuth = await fetch(`${URL_}/functions/v1/unlock`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId: 'zugspitze', lat: 0, lng: 0, accuracy: 5 }),
  });
  check('unlock ohne Auth abgelehnt', noAuth.status === 401, `HTTP ${noAuth.status}`);

  // 6b) Ungültige Eingaben → 400
  const badInput = await callUnlock({ placeId: 'zugspitze', lat: 'foo', lng: 10, accuracy: 5 });
  check('unlock ungültige Eingabe → 400', badInput.status === 400, `HTTP ${badInput.status}`);
  const badPlace = await json(await callUnlock({ placeId: 'gibt-es-nicht', lat: 47.4211, lng: 10.9863, accuracy: 10 }));
  check('unlock unbekannter Ort → UNKNOWN_PLACE', badPlace?.code === 'UNKNOWN_PLACE', `code: ${badPlace?.code}`);

  // 7) Zu weit entfernt (Berlin → Zugspitze) → TOO_FAR mit Distanz
  const far = await json(await callUnlock({ placeId: 'zugspitze', lat: 52.52, lng: 13.405, accuracy: 10 }));
  check('unlock zu weit → TOO_FAR', far?.code === 'TOO_FAR' && far?.distanceM > 100000, `code: ${far?.code}, distanzM: ${far?.distanceM}`);

  // 8) Genauigkeit > 100 m → ACCURACY_TOO_LOW
  const coarse = await json(await callUnlock({ placeId: 'zugspitze', lat: 47.4211, lng: 10.9863, accuracy: 150 }));
  check('unlock ungenau → ACCURACY_TOO_LOW', coarse?.code === 'ACCURACY_TOO_LOW', `code: ${coarse?.code}`);

  // 9) Mock-Flag → MOCK_LOCATION
  const mock = await json(await callUnlock({ placeId: 'zugspitze', lat: 47.4211, lng: 10.9863, accuracy: 10, isMocked: true }));
  check('unlock mock → MOCK_LOCATION', mock?.code === 'MOCK_LOCATION', `code: ${mock?.code}`);

  // 10) Innerhalb des Radius → UNLOCKED, danach idempotent ALREADY_UNLOCKED
  const okRes = await json(await callUnlock({ placeId: 'zugspitze', lat: 47.4211, lng: 10.9863, accuracy: 10 }));
  check('unlock vor Ort → UNLOCKED', okRes?.code === 'UNLOCKED' && !!okRes?.unlockedAt, `code: ${okRes?.code}`);
  const again = await json(await callUnlock({ placeId: 'zugspitze', lat: 47.4211, lng: 10.9863, accuracy: 10 }));
  check('unlock erneut → ALREADY_UNLOCKED', again?.code === 'ALREADY_UNLOCKED', `code: ${again?.code}`);

  // 11) Eigener Unlock jetzt lesbar
  const ownAfter = await json(await fetch(`${URL_}/rest/v1/unlocks?select=place_id`, { headers: userHeaders }));
  check('eigener Unlock sichtbar', Array.isArray(ownAfter) && ownAfter.some((r) => r.place_id === 'zugspitze'), `rows: ${ownAfter?.length ?? '—'}`);

  // 12) Cross-User (AP3-TODO eingelöst): Nutzer B sieht Unlocks von A nicht
  const signB = await fetch(`${URL_}/auth/v1/signup`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const sessionB = signB.ok ? await signB.json() : null;
  if (sessionB?.access_token) {
    const otherRows = await json(await fetch(`${URL_}/rest/v1/unlocks?select=place_id`, {
      headers: { apikey: KEY, Authorization: `Bearer ${sessionB.access_token}` },
    }));
    check('Fremd-Unlocks nicht lesbar (Cross-User)', Array.isArray(otherRows) && otherRows.length === 0, `rows: ${otherRows?.length ?? '—'}`);
  } else {
    check('Fremd-Unlocks nicht lesbar (Cross-User)', false, 'zweite Anmeldung fehlgeschlagen');
  }

  // ---------- AP8: Edge Function `delete-account` ----------
  // Nutzer A hat einen Unlock (Check 10); Löschung muss User + Unlocks entfernen.
  const delRes = await fetch(`${URL_}/functions/v1/delete-account`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  const delBody = await json(delRes);
  check('delete-account löscht eigenes Konto', delRes.ok && delBody?.ok === true, `HTTP ${delRes.status}`);

  // Token des gelöschten Nutzers ist ungültig → kein Datenzugriff mehr
  const afterDelete = await fetch(`${URL_}/auth/v1/user`, {
    headers: { apikey: KEY, Authorization: `Bearer ${session.access_token}` },
  });
  check('Token nach Löschung ungültig', afterDelete.status === 401 || afterDelete.status === 403, `HTTP ${afterDelete.status}`);

  // Unlocks des gelöschten Nutzers sind weg (FK-Cascade): Nutzer B sieht weiterhin nichts,
  // und ein frischer Nutzer C kann denselben Ort erneut freischalten (kein Konflikt).
  const signC = await fetch(`${URL_}/auth/v1/signup`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const sessionC = signC.ok ? await signC.json() : null;
  if (sessionC?.access_token) {
    const cUnlock = await json(await callUnlock({ placeId: 'zugspitze', lat: 47.4211, lng: 10.9863, accuracy: 10 }, sessionC.access_token));
    check('Cascade: Ort nach Löschung erneut freischaltbar', cUnlock?.code === 'UNLOCKED', `code: ${cUnlock?.code}`);
    // Aufräumen: Wegwerf-Nutzer C ebenfalls löschen
    await fetch(`${URL_}/functions/v1/delete-account`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${sessionC.access_token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
  } else {
    check('Cascade: Ort nach Löschung erneut freischaltbar', false, 'dritte Anmeldung fehlgeschlagen');
  }
}

console.log(failures === 0 ? '\nAlle Backend-Checks (AP3 + AP6) bestanden.' : `\n${failures} Check(s) fehlgeschlagen.`);
process.exit(failures === 0 ? 0 : 1);
