# AP9 — Härtung & Release: Implementierungsplan

Status: **umgesetzt** (Checks grün; Live-Verify inkl. 429/405/400 PASS; QA: „AP abnehmbar") · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP9), §10 · Branch: `claude/ap9-haertung` (basiert auf main = AP1–AP8 + AP-R/R2)

## Ziel & Akzeptanzkriterien

Rate Limit, isMocked, Plausibilitäts-Flagging, App-Icons/Splash, EAS-Builds, Store-Texte.

- [x] Rate Limit aktiv: max. 10 Unlock-Versuche/Stunde/Nutzer (§10) — live per verify.mjs belegt (429 RATE_LIMITED)
- [x] Plausibilitäts-Flagging: physikalisch unmögliche Folge-Unlocks (> 250 km/h) werden serverseitig geloggt/geflaggt
- [x] Review-Vormerkungen abgearbeitet: Client-Fehlerdifferenzierung (Netz vs. 4xx/429), Body-Size-Limit, isMocked-Typvalidierung, METHOD_NOT_ALLOWED-Test
- [x] Release-Artefakte: `eas.json` (Build-Profile), Store-Texte-Entwurf, Release-Checkliste mit §10-Security-Punkten
- [x] Beta-Build: in der Cloud nicht baubar (EAS-Account/Apple-Credentials nötig) — exakte Anleitung + Voraussetzungen dokumentiert (A-AP9-1)

## Schritte

1. **Migration `unlock_attempts`**: schlanke Versuchstabelle (user_id, place_id, attempted_at), Index, RLS ohne Client-Policies (nur Service Role) — Grundlage für das Rate Limit.
2. **Edge Function `unlock` härten**: Body-Size-Limit (2 KB), `isMocked`-Typvalidierung, Versuch protokollieren, Rate Limit (≥ 10 Versuche/h → HTTP 429 `RATE_LIMITED`), Plausibilität: Tempo seit letztem Unlock > 250 km/h → `console.warn`-Flag (MVP: loggen, nicht blocken — §10 „Flag").
3. **Client**: Fehlerdifferenzierung in `useUnlock` (`FunctionsFetchError` → offline; HTTP 429 → eigener Text; sonstige 4xx/5xx → generischer Fehler statt fälschlich „Keine Verbindung").
4. **verify.mjs**: METHOD_NOT_ALLOWED (405), `isMocked`-Typfehler (400), Rate-Limit-Schleife (429 spätestens beim 11. Versuch).
5. **Release-Artefakte**: `eas.json` (development/preview/production), `docs/Store-Texte.md` (deutsche Entwürfe aus Website-Tonalität), `docs/Release-Checkliste.md` (§10-Security-Checkliste + offene Nutzer-Aufgaben: Google-Maps-Key, EAS-Account, Rechtstexte, Gerätetests, Koordinaten-Verifikation).
6. Deploy + Live-Verify, Checks, QA-Abnahme, Push.

## Annahmen

- A-AP9-1: **EAS-Builds laufen auf deiner Maschine/deinem Konto** (`eas build`), nicht in dieser Umgebung (Account, Apple/Google-Credentials). Die Konfiguration ist vollständig vorbereitet; Akzeptanz „Beta-Build installierbar" ist damit eine dokumentierte Nutzer-Aktion.
- A-AP9-2: App-Icons/Splash aus dem Favicon-SVG bestehen seit AP1 (`assets/brand/` → generierte PNGs) und gelten als Release-Icons; Feinschliff ist Geschmackssache, kein Blocker.
- A-AP9-3: Plausibilitäts-Flagging blockt im MVP nicht (nur Warn-Log mit user/place/Tempo) — bewusst konservativ, um Bahnfahrer/Seilbahnen nicht fälschlich auszusperren; Verschärfung später datenbasiert.
- A-AP9-4: App-Attestation (Play Integrity / App Attest) bleibt Ausbaustufe bis zum Shop (§10).
