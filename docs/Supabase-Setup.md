# Supabase-Setup & Deployment

Projekt: `eqkpnphfdopvnywkenyk` · Der Client kennt nur URL + Publishable/Anon-Key (`.env`, gitignored; Vorlage `.env.example`).

## Lokale `.env` anlegen (Pflicht vor `expo start`)

Ohne diese Datei wirft die App beim Start „EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY müssen gesetzt sein". Beide Werte sind öffentliche Client-Werte (kein Secret — Zugriff ist durch RLS abgesichert):

```sh
cat > .env <<'ENV'
EXPO_PUBLIC_SUPABASE_URL=https://eqkpnphfdopvnywkenyk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FOxYVB83wqsSmUKaNJt09Q_bCxNOeCD
ENV
```

Danach den Dev-Server neu starten (`npx expo start -c`, damit Metro die Env neu einliest).

## Migrationen deployen

```sh
export SUPABASE_ACCESS_TOKEN=sbp_…       # Personal Access Token, NICHT ins Repo
npx supabase link --project-ref eqkpnphfdopvnywkenyk
npx supabase db push                     # spielt supabase/migrations/* ein
```

## Dashboard-Konfiguration (nicht in Migrationen abbildbar)

- [x] **Anonymous Sign-Ins aktivieren** (Authentication → Sign In / Up → Anonymous) — sonst schlägt `ensureSession()` (`src/lib/auth.ts`) zur Laufzeit fehl. *(aktiviert, per verify.mjs bestätigt)*

## Hinweis für Cloud-Umgebungen

`supabase db push` braucht direkten Postgres-Zugang (TCP 5432/6543). In Umgebungen, die nur HTTPS erlauben, stattdessen die Management-API nutzen (`POST https://api.supabase.com/v1/projects/<ref>/database/query` mit `SUPABASE_ACCESS_TOKEN`) und die Historie in `supabase_migrations.schema_migrations` nachtragen.

## Verifikation (AP3-Akzeptanzkriterien)

```sh
node supabase/verify.mjs   # nutzt nur URL + Anon-Key, wie die App
```

Prüft: Orte via API lesbar (8 Seeds), Client-Insert in `unlocks` abgelehnt (anonym + eingeloggt), anonyme Anmeldung, eigene Unlocks lesbar. Der Cross-User-Negativtest („Fremd-Unlocks nicht lesbar") folgt in AP6, sobald die Edge Function Testdaten erzeugen kann.

## Konventionen

- Inhalts-/Schemaänderungen immer per neuer Migration, nie durch Editieren bestehender.
- Neue Tabellen folgen dem Muster der Init-Migration: RLS aktivieren, minimale Select-Policies, `revoke insert, update, delete … from anon, authenticated` als Defense-in-depth.
- Der Seed-Upsert aktualisiert `active` bewusst nicht — Sichtbarkeit wird operativ gesteuert, nicht durch den Inhalts-Seed.
