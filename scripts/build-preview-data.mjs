// Erzeugt src/lib/previewData.ts aus den Seed-Migrationen (AP-D, Web-Vorschau).
// Aufruf: node scripts/build-preview-data.mjs
// Nach jeder Änderung an Seed-Orten oder Koordinaten (docs/Koordinaten-Checkliste.md)
// neu ausführen und anschließend `npx prettier --write src/lib/previewData.ts`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATION_DIR = 'supabase/migrations';
// Alle Migrationen in Reihenfolge: Seeds (insert … on conflict) und spätere
// Korrekturen (update public.places set … where id = '…', Koordinaten-Checkliste).
const MIGRATIONS = readdirSync(join(root, MIGRATION_DIR))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => `${MIGRATION_DIR}/${f}`);

/** Einige Orte gelten in der Vorschau als erwandert, damit beide Zustände sichtbar sind. */
const PREVIEW_UNLOCKS = [
  ['zugspitze', '2026-08-14T09:42:00Z'],
  ['koenigssee', '2026-08-16T15:10:00Z'],
  ['brocken', '2026-09-03T11:25:00Z'],
  ['ladenburg-marktplatz', '2026-09-20T17:05:00Z'],
  ['ladenburg-martinstor', '2026-09-20T17:31:00Z'],
  ['ladenburg-galluskirche', '2026-09-21T10:12:00Z'],
];

/** Zerlegt `(a, 'b', 3), (…)` in Tupel aus Strings/Zahlen/null. */
function parseTuples(sql) {
  const tuples = [];
  let i = 0;
  while (i < sql.length) {
    if (sql[i] !== '(') {
      i += 1;
      continue;
    }
    i += 1;
    const values = [];
    let token = '';
    while (i < sql.length && sql[i] !== ')') {
      const ch = sql[i];
      if (ch === "'") {
        let s = '';
        i += 1;
        while (i < sql.length) {
          if (sql[i] === "'" && sql[i + 1] === "'") {
            s += "'";
            i += 2;
          } else if (sql[i] === "'") {
            i += 1;
            break;
          } else {
            s += sql[i];
            i += 1;
          }
        }
        values.push(s);
        token = '';
        continue;
      }
      if (ch === ',') {
        if (token.trim()) values.push(literal(token.trim()));
        token = '';
      } else {
        token += ch;
      }
      i += 1;
    }
    if (token.trim()) values.push(literal(token.trim()));
    tuples.push(values);
    i += 1;
  }
  return tuples;
}

function literal(t) {
  if (t.toLowerCase() === 'null') return null;
  const n = Number(t);
  if (Number.isNaN(n)) throw new Error(`Unbekanntes Literal: ${t}`);
  return n;
}

/** `insert into public.<table> (cols) values … on conflict` → Objekte. */
function inserts(sql, table) {
  const re = new RegExp(
    `insert into public\\.${table}\\s*\\(([^)]*)\\)\\s*values([\\s\\S]*?)on conflict`,
    'gi',
  );
  const rows = [];
  for (const m of sql.matchAll(re)) {
    const cols = m[1].split(',').map((c) => c.trim());
    for (const values of parseTuples(m[2])) {
      if (values.length !== cols.length) {
        throw new Error(`${table}: ${values.length} Werte für ${cols.length} Spalten`);
      }
      rows.push(Object.fromEntries(cols.map((c, k) => [c, values[k]])));
    }
  }
  return rows;
}

/** `update public.places set a = 1, b = 'x' where id = '…';` → [id, Änderungen]. */
function updates(sql) {
  const re = /update public\.places\s+set([\s\S]*?)where\s+id\s*=\s*'([^']+)'\s*;/gi;
  return [...sql.matchAll(re)].map((m) => {
    const changes = {};
    for (const part of m[1].split(/,(?=\s*[a-z_]+\s*=)/i)) {
      const [col, ...rest] = part.split('=');
      const raw = rest.join('=').trim();
      changes[col.trim()] = raw.startsWith("'") ? raw.slice(1, -1).replace(/''/g, "'") : literal(raw);
    }
    return [m[2], changes];
  });
}

const byId = new Map();
const regionRows = [];
const usedFiles = [];
for (const file of MIGRATIONS) {
  // SQL-Kommentare entfernen (enthalten Klammern)
  const sql = readFileSync(join(root, file), 'utf8').replace(/--.*$/gm, '');
  const rows = inserts(sql, 'places');
  const ups = updates(sql);
  const regs = inserts(sql, 'regions');
  if (rows.length || ups.length || regs.length) usedFiles.push(file.split('/').pop());
  rows.forEach((r) => byId.set(r.id, { ...byId.get(r.id), ...r }));
  ups.forEach(([id, changes]) => {
    if (!byId.has(id)) throw new Error(`${file}: Update für unbekannten Ort ${id}`);
    byId.set(id, { ...byId.get(id), ...changes });
  });
  regionRows.push(...regs);
}

const places = [...byId.values()].map((p) => ({
  id: p.id,
  name: p.name,
  region: p.region,
  type: p.type,
  description: p.description,
  elevation_m: p.elevation_m,
  lat: p.lat,
  lng: p.lng,
  unlock_radius_m: p.unlock_radius_m,
  badge_motif: p.badge_motif,
  badge_shape: p.badge_shape,
  badge_tone: p.badge_tone,
  active: true,
  region_id: p.region_id ?? null,
}));
const regions = regionRows.map((r) => ({
  id: r.id,
  name: r.name,
  parent_id: r.parent_id ?? null,
  active: true,
}));

const ids = new Set(places.map((p) => p.id));
for (const [id] of PREVIEW_UNLOCKS) {
  if (!ids.has(id)) throw new Error(`Vorschau-Unlock für unbekannten Ort: ${id}`);
}

const js = (v) => JSON.stringify(v, null, 2).replace(/"([a-z_]+)":/g, '$1:');
const out = `import type { Place } from './places';
import type { Region } from './regions';
import type { Unlock } from './unlocks';

/**
 * Vorschau-Daten für die Web-Vorschau (AP-D) — generiert aus den Migrationen
 * ${usedFiles.map((f) => `\`${f}\``).join(', ')}
 * durch \`npm run preview:data\` (nicht von Hand bearbeiten).
 * Wird ausschließlich genutzt, wenn \`isPreview\` gilt (nur Web + EXPO_PUBLIC_PREVIEW=1).
 */
export const previewPlaces: Place[] = ${js(places)};

export const previewRegions: Region[] = ${js(regions)};

/** Einige Orte gelten in der Vorschau als erwandert, damit beide Zustände sichtbar sind. */
export const previewUnlocks: Unlock[] = ${js(
  PREVIEW_UNLOCKS.map(([place_id, unlocked_at]) => ({ place_id, unlocked_at })),
)};
`;
writeFileSync(join(root, 'src/lib/previewData.ts'), out);
console.log(`previewData.ts: ${places.length} Orte, ${regions.length} Regionen`);
