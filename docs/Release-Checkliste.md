# Release-Checkliste (AP9)

## Security-Checkliste aus Projektplan §10

- [x] Freischaltung nur serverseitig (Edge Function; Client-Inserts per RLS abgelehnt — verify.mjs)
- [x] RLS auf `places`, `unlocks`, `regions`, `unlock_attempts`; Cross-User-Lesen ausgeschlossen (verify.mjs)
- [x] Rate Limit: max. 10 Unlock-Versuche/h/Nutzer (429 — verify.mjs)
- [x] Mock-Location: Client-Block (Android) + Server-Flag/Ablehnung (verify.mjs)
- [x] Plausibilitäts-Flagging: Tempo > 250 km/h zwischen Unlocks wird serverseitig geloggt (A-AP9-3: loggen, nicht blocken)
- [x] Eingabe-Validierung + Body-Limit (400/413), nur POST (405)
- [x] Keine Secrets im Repo; Client kennt nur URL + Publishable Key; Service Role nur in Edge Functions (Env)
- [x] Standort-Datenminimierung: Foreground on demand; genau ein Snapshot pro Unlock; kein Koordinaten-Logging
- [x] Konto-Löschung entfernt Auth-User + Unlocks (Cascade — verify.mjs)
- [ ] App-Attestation (Play Integrity / App Attest) — bewusst Ausbaustufe bis zum Shop (A-AP9-4)

## Offene Aufgaben vor öffentlichem Release (Nutzer-Aktionen)

- [ ] **Rechtstexte finalisieren** (Impressum, Datenschutz inkl. Standort-Snapshot-Hinweis) — ersetzen die Platzhalter in `src/app/rechtliches.tsx` / `de.ts`
- [ ] **Google-Maps-API-Key** für Android-Builds besorgen und in `app.json` (`android.config.googleMaps.apiKey`) via EAS-Secret setzen
- [ ] **Koordinaten verifizieren** (`docs/Koordinaten-Checkliste.md` — 8 Gipfel + 7 Ladenburg-Hotspots)
- [ ] **Manuelle Gerätetests** durchführen (Permission-Testplan AP5, Edge-Case-Testplan AP6, Flugmodus-Test AP7)
- [ ] **Supabase-Access-Token rotieren** (das in der Entwicklung verwendete Token widerrufen)

## Beta-Build (A-AP9-1 — auf deinem Rechner/Konto)

```sh
npm install -g eas-cli
eas login                          # Expo-Konto
eas build:configure                # einmalig: Projekt verknüpfen (projectId in app.json)
eas build --profile preview --platform ios       # TestFlight-fähiges Build (Apple-Credentials nötig)
eas build --profile preview --platform android   # Internal-Track-APK/AAB
eas submit --platform ios|android  # optional: direkt einreichen
```

Voraussetzungen: Expo-Konto, Apple Developer Program (iOS), Google Play Console (Android).
