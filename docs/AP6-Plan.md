# AP6 — Unlock-Flow: Implementierungsplan

Status: **in Arbeit** · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP6), §9 (Geolocation-Logik), §10 (Sicherheit) · Branch: `claude/ap6-unlock` (basiert auf main = AP1–AP5)

## Ziel & Akzeptanzkriterien

Permission-Handling, Standortmessung, Edge Function `unlock`, alle Fehlerfälle aus §9, Prägung-Animation.

- [ ] Innerhalb Radius: Unlock + Animation
- [ ] Außerhalb: Distanzmeldung
- [ ] Alle 8 Edge Cases aus §9 behandelt (manueller Mock-Location-Testplan dokumentiert)
- [ ] Unlock nur serverseitig möglich (Client kann nicht direkt schreiben — per verify.mjs belegt)

## Schritte

1. **Edge Function `supabase/functions/unlock/index.ts`** (Deno):
   - Auth-Pflicht (JWT des anonymen Nutzers), Eingabe `{placeId, lat, lng, accuracy, isMocked}`.
   - Validierung: Ort existiert + aktiv; lat/lng/accuracy plausibel; `isMocked → MOCK_LOCATION`; `accuracy > 100 → ACCURACY_TOO_LOW`.
   - Haversine serverseitig; Regel `distance <= unlock_radius_m + min(accuracy, 50)`; sonst `TOO_FAR` mit `distanceM`.
   - Idempotent: bereits freigeschaltet → `ALREADY_UNLOCKED` mit bestehendem Datum.
   - Insert in `unlocks` mit Service Role (Audit-Snapshot lat/lng/accuracy/distance).
   - Business-Ergebnisse als HTTP 200 + `{ok, code, …}`; 400/401 nur für ungültige Requests.
2. **Client `src/lib/geo.ts`:** Haversine + Unlock-Regel (nur für Anzeige/Tests — Entscheidung bleibt Server) + `formatDistance` („Noch 3,2 km") + Unit-Tests.
3. **Client-Flow `src/features/unlock/`:**
   - `useUnlock.ts`: Zustandsmaschine idle → Permission → Messung (Accuracy.High, 15 s Timeout, bis zu 2× nachmessen bei accuracy > 50) → Edge-Function-Call → Ergebnis. Alle §9-Fälle gemappt (Permission verweigert inkl. Settings-Link bei `canAskAgain === false`, GPS-Timeout, ungenau, zu weit mit Distanz, offline, bereits frei, Mock-Location clientseitig blockiert + Flag).
   - `UnlockSection.tsx`: „Stocknagel prägen"-Button (ink-Pill), Statusmeldungen in Marken-Ton, Erfolg → Prägung-Animation.
   - `PraegeAnimation`: Pop (Scale .4→1.12→1) + expandierender Brass-Ring (Scale .5→2.4, Opacity .7→0) — Port der `karte.html`-Keyframes `pop`/`ring`.
4. **Detail-Screen:** UnlockSection ersetzt den Entfernungs-Platzhalter (A-AP4-1 wird eingelöst: gemessene Distanz wird angezeigt); nach Erfolg Badge entnebelt + Query-Invalidierung.
5. **verify.mjs erweitern (E2E):** Unlock innerhalb Radius (Seed-Koordinaten) → ok; zu weit → TOO_FAR; accuracy > 100 → abgelehnt; Mock-Flag → abgelehnt; **Cross-User-Test** (AP3-TODO): Nutzer B sieht Unlocks von Nutzer A nicht.
6. **Deployment:** `supabase functions deploy unlock` (Management-API über HTTPS, Token erforderlich); danach verify.mjs gegen das Live-Projekt.
7. Reviews: `supabase-reviewer` + `geolocation-reviewer` + `security-privacy-reviewer`, QA-Abnahme, Push.

## Annahmen

- A-AP6-1: **Rate Limiting und Plausibilitäts-Flagging sind AP9** (Projektplan §11 „Härtung"). Die Edge Function ist so strukturiert, dass beides dort ergänzt werden kann.
- A-AP6-2: `isMocked` ist nur auf Android verfügbar (`LocationObject.mocked`); iOS hat kein Pendant — dort greift nur die serverseitige Plausibilität (AP9). Client blockiert Mock-Standorte und sendet das Flag zusätzlich an den Server (Defense in depth).
- A-AP6-3: Business-Ergebnisse (TOO_FAR etc.) kommen als HTTP 200 mit `code`-Feld — vermeidet fehleranfälliges Fehler-Parsing im Client.
- A-AP6-4: Der E2E-Test in verify.mjs erzeugt echte Unlocks für Wegwerf-Anon-Nutzer im Live-Projekt; das ist akzeptiert (keine Testdaten-Verschmutzung relevanter Konten).

## Explizit nicht in AP6

Onboarding/Permission-Priming-Screen (AP8), Rate Limit + App-Attestation + Plausibilitäts-Flagging (AP9), Sammlung-Tab (AP7).

## Manueller Edge-Case-Testplan (§9, vor Release auf echtem Gerät)

Serverseitige Fälle sind per `node supabase/verify.mjs` automatisiert belegt (TOO_FAR, ACCURACY_TOO_LOW, MOCK_LOCATION, UNLOCKED, ALREADY_UNLOCKED, 401, Cross-User-RLS). Auf dem Gerät zusätzlich:

1. Permission verweigert → Meldung + bei „Nie erlauben" Settings-Link (Linking.openSettings).
2. GPS-Timeout (Gebäude/Flugmodus mit WLAN) → Timeout-Meldung nach max. 15 s, Retry möglich.
3. Genauigkeit > 100 m (Innenraum) → „Standort zu ungenau (±x m)", Nachmessen (bis 3 Messungen) greift.
4. Zu weit entfernt → Distanzmeldung „Noch x,x km bis zum Ziel" (Wert plausibel).
5. Knapp außerhalb (≤ 2× Radius, per Mock-Standort) → gleiche Meldung mit Meterangabe.
6. Offline am Ort (Flugmodus nach Messung) → „Keine Verbindung …", Retry.
7. Bereits freigeschaltet → Button durch „Erwandert am …" ersetzt (kein erneuter Flow).
8. Mock-Location (Android Developer-Option) → clientseitige Ablehnung; mit manipuliertem Client lehnt der Server ab (verify.mjs Check 9).
