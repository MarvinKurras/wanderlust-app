# Supabase-Setup & Deployment

Projekt: `eqkpnphfdopvnywkenyk` · Der Client kennt nur URL + Publishable/Anon-Key (`.env`, gitignored; Vorlage `.env.example`).

## Migrationen deployen

```sh
export SUPABASE_ACCESS_TOKEN=sbp_…       # Personal Access Token, NICHT ins Repo
npx supabase link --project-ref eqkpnphfdopvnywkenyk
npx supabase db push                     # spielt supabase/migrations/* ein
```

## Dashboard-Konfiguration (nicht in Migrationen abbildbar)

- [ ] **Anonymous Sign-Ins aktivieren** (Authentication → Sign In / Up → Anonymous) — sonst schlägt `ensureSession()` (`src/lib/auth.ts`) zur Laufzeit fehl.

## Verifikation (AP3-Akzeptanzkriterien)

```sh
node supabase/verify.mjs   # nutzt nur URL + Anon-Key, wie die App
```

Prüft: Orte via API lesbar (8 Seeds), Client-Insert in `unlocks` abgelehnt (anonym + eingeloggt), anonyme Anmeldung, eigene Unlocks lesbar. Der Cross-User-Negativtest („Fremd-Unlocks nicht lesbar") folgt in AP6, sobald die Edge Function Testdaten erzeugen kann.

## Konventionen

- Inhalts-/Schemaänderungen immer per neuer Migration, nie durch Editieren bestehender.
- Neue Tabellen folgen dem Muster der Init-Migration: RLS aktivieren, minimale Select-Policies, `revoke insert, update, delete … from anon, authenticated` als Defense-in-depth.
- Der Seed-Upsert aktualisiert `active` bewusst nicht — Sichtbarkeit wird operativ gesteuert, nicht durch den Inhalts-Seed.
