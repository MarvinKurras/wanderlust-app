/**
 * AP3-Abnahme: prüft Schema-Deploy und RLS-Wirkung aus Client-Sicht.
 * Nutzt ausschließlich URL + Anon-Key (wie die App). Aufruf:
 *   node supabase/verify.mjs   (liest .env im Repo-Root oder Umgebungsvariablen)
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
  // TODO (AP6): „Fremd-Unlocks nicht lesbar" als echter Cross-User-Test —
  // erst möglich, sobald die Edge Function `unlock` Testdaten erzeugen kann.
  const own = await fetch(`${URL_}/rest/v1/unlocks?select=place_id`, { headers: userHeaders });
  const ownRows = own.ok ? await own.json() : null;
  check('eigene unlocks lesbar (leer)', own.ok && Array.isArray(ownRows) && ownRows.length === 0, `HTTP ${own.status}, rows: ${ownRows?.length ?? '—'}`);
}

console.log(failures === 0 ? '\nAlle AP3-Checks bestanden.' : `\n${failures} Check(s) fehlgeschlagen.`);
process.exit(failures === 0 ? 0 : 1);
