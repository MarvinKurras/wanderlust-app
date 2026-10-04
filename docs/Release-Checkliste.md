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
- [ ] **Privacy-Labels** in App Store Connect / Play Console gemäß `docs/Store-Texte.md` („App-Privacy / Data Safety") eintragen
- [ ] **Nach der Koordinatenprüfung** die Vorschau-Daten neu erzeugen: `npm run preview:data`

## Web-Vorschau (AP-D) — nie als Produkt ausliefern

- [ ] `EXPO_PUBLIC_PREVIEW` steht in **keinem** `eas.json`-Profil und in keinem EAS-Secret (nur in den Skripten `preview:*`)
- [ ] `dist/preview` (statischer Export) nicht öffentlich hosten; Vorschau-Artefakte sind privat
- [ ] Kein Web-Build mit echter Supabase-Env veröffentlichen — Prägen ist im Browser ohnehin gesperrt (`de.unlock.nurApp`), die Daten wären aber erreichbar

## Gerätetests Design-Overhaul (AP-D / AP-D2)

- [ ] iOS 26: Liquid Glass (Tab-Leiste, Chips, Kopfleisten) — iOS 16.4–18: Blur-Fallback lesbar
- [ ] Skia-Messingglanz auf erwanderten Schildern folgt der Neigung, keine Artefakte (Shader ohne `pow`)
- [ ] Neigungssensor stoppt in Hintergrund/anderen Tabs (Akku: Xcode Energy Log bzw. Android Battery Historian grob prüfen)
- [ ] Android-Kartenstil (Pergament) und iOS `mutedStandard`; blauer Punkt nur bei sichtbarer Karte
- [ ] Schatten: Android 8–11 ohne `filter: drop-shadow` — Schilder ohne Schlagschatten akzeptabel? (bekannte Abweichung), `boxShadow` erst ab Android 9
- [ ] Stocknägel (AP-D2): Perlrand (gestrichelte Kontur, runde Kappen) auf Android sichtbar, Schraffur/Konturen scharf, 15 Schilder in Liste/Sammlung flüssig
- [ ] Haptik der Prägung (iOS + Android; ggf. `android.permission.VIBRATE` per `npx expo config --type introspect` prüfen)
- [ ] „Bewegung reduzieren": keine Dauerschleifen, keine Parallaxe, Prägung ohne Schläge, Erfolgs-Haptik bleibt
- [ ] Statusleiste: hell auf Sammlung, Ort-Bühne und Prägung; dunkel sonst
- [ ] Beim ersten TestFlight-Upload auf ITMS-90683 (fehlende Always-Location-Keys) achten — App nutzt nur WhenInUse
- [ ] Edge Function `unlock`: im Insert-Fehlerpfad nur `code` loggen (Postgres-DETAIL kann Koordinaten enthalten) — supabase-reviewer

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
