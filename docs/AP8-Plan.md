# AP8 — Onboarding & Settings: Implementierungsplan

Status: **in Arbeit** · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP8) · Branch: `claude/ap8-onboarding` (basiert auf main = AP1–AP7)

## Ziel & Akzeptanzkriterien

3-Schritte-Intro (aus „So funktioniert's"), Permission-Priming, Konto-Upgrade, Konto-Löschung, Datenschutztext.

- [ ] Erststart-Flow vollständig (Intro → Priming → App; wird nur einmal gezeigt)
- [ ] Löschung entfernt Auth-User + Unlocks (FK-Cascade; per verify.mjs belegt)

## Schritte

1. **Onboarding** (`src/app/onboarding.tsx` + `src/features/onboarding/`):
   - 3 Schritte mit Texten aus Website `index.html` „So funktioniert's" (01 Sei vor Ort / 02 Abzeichen wird geprägt / 03 Dein Stock wächst) im Paper-Look (Eyebrow „01 / Besuchen" …).
   - 4. Schritt **Permission-Priming**: erklärt den Standortzweck (kein Tracking) vor dem System-Dialog; „Standort erlauben" (ruft `requestForegroundPermissionsAsync`) oder „Später" — App bleibt ohne Permission nutzbar (§9/§10).
   - Gesehen-Flag in AsyncStorage; Root-Layout leitet beim Erststart auf `/onboarding` um.
2. **Edge Function `delete-account`**: Auth-Pflicht; löscht den eigenen Auth-User per Admin-API (Service Role) — `unlocks` fallen über `on delete cascade` (§7). Deploy + E2E in `verify.mjs` (Wegwerf-User: Unlock anlegen → Konto löschen → Token ungültig).
3. **Einstellungen** (`src/app/einstellungen.tsx`, Modal; Zahnrad im Sammlung-Header):
   - **Konto**: anonymer Status sichtbar; Upgrade-Formular (E-Mail) via `supabase.auth.updateUser({ email })` → Hinweis „Bestätigungs-Mail unterwegs"; nach Bestätigung ist das Konto dauerhaft.
   - **Konto löschen**: Bestätigungsdialog → Edge Function → lokales Sign-out + Cache-Reset.
   - **Rechtliches**: Impressum/Datenschutz als gekennzeichnete Platzhalter (`src/app/rechtliches.tsx`) — verbindliche Entscheidung: Finalisierung vor Release (AP9-Checkliste). Der Standort-Snapshot pro Unlock (§10) ist im Platzhalter bereits erwähnt.
4. Reviews (`security-privacy-reviewer`-Checks, `website-design-auditor`, QA), Checks, Push.

## Annahmen

- A-AP8-1: Schritt-3-Text endet mit „— Gipfel um Gipfel." statt des Website-Satzes „Teile ihn, vergleiche Routen, vervollständige Regionen." (verspricht Nicht-MVP-Features Social/Routen).
- A-AP8-2: Konto-Upgrade nur per E-Mail (Magic-Link/Bestätigung durch Supabase-Standardflow); Passwort-Setzen und OAuth sind Ausbaustufe.
- A-AP8-3: Onboarding-Flag lokal (AsyncStorage) — nach Neuinstallation erscheint das Intro erneut (gewollt).
- A-AP8-4: Kein eigener Settings-Tab (3-Tab-Struktur ist verbindlich); Einstieg über Zahnrad-Icon in der Sammlung.

## Explizit nicht in AP8

Rate Limiting/Härtung/Store-Texte (AP9), finale Rechtstexte (vor Release), OAuth/Passwort-Login (Ausbaustufe), Datenexport (Ausbaustufe).
