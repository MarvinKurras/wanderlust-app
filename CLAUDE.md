# Wanderlust App — Projektregeln (CLAUDE.md)

Mobile Wander-App: Nutzer schalten digitale „Stocknägel" (Badges) für real besuchte Orte per GPS-Prüfung frei. Verbindlicher Plan: `docs/Wanderlust-App-Projektplan.md`. AP-Pläne liegen in `docs/`.

## Verbindliche Entscheidungen (nicht ohne Auftrag ändern)

- **Eigenständige Expo/React-Native-App mit TypeScript. Keine WebView.**
- **Website-Repo (`../wanderlust` bzw. `marvinkurras/wanderlust`) ist read-only Referenz** für Design-Tokens, Badge-Logik, Assets und Inhalte. Nichts blind kopieren — nur gezielt portieren.
- **Karte:** Standardkarte (`react-native-maps`) im MVP. Keine eigene gemalte Map.
- **Auth:** Supabase Anonymous Auth im MVP. Kein rein lokales Unlock-System.
- **Freischaltung wird serverseitig validiert** (Supabase Edge Function + RLS). Der Client entscheidet nie über einen Unlock; er kann nicht direkt in `unlocks` schreiben.
- **Unlock-Regel:** `distance <= unlock_radius_m + min(accuracy, 50)`; keine Freischaltung bei `accuracy > 100 m`.
- **Radius:** Standard 250 m, pro Ort überschreibbar (sinnvoll: 200–500 m je nach Ortstyp).
- **Koordinaten der Website sind nicht final.** Pro Ort wird ein konkreter Freischaltpunkt definiert und vor Release manuell geprüft (`docs/`-Checkliste pflegen).
- **Shop:** Nur sichtbarer, deaktivierter Teaser („bald verfügbar"). Kein Checkout im MVP.
- **Plattformen:** iOS 16.4+ und Android 8+ (minSdk 26).
- **Rechtliches:** In der Entwicklung Placeholder. Vor öffentlichem Release: Impressum, Datenschutz, Standortdaten-Hinweis, Konto-/Datenlöschung finalisieren.

## Architektur

- Expo (Managed Workflow), Expo Router: 3 Tabs (Karte, Orte, Sammlung) + Stack/Modal (Ort-Detail, Unlock-Flow, Onboarding).
- State: Zustand (Client) + TanStack Query (Server). Persistenz: AsyncStorage + Query-Cache.
- Badges: Portierung der SVG-Logik aus `wanderlust/badges.js` nach `react-native-svg` (3 Formen, 4 Metalltöne, 6 Motive) — pixel-treu zur Website.
- Backend: Supabase (Postgres, RLS, Edge Function `unlock`). Schema siehe Projektplan §7.
- Geolocation: `expo-location`, nur Foreground, on demand. Kein Tracking, keine Bewegungsprofile.

## Design-System (Quelle: Website)

Farben: `ink #1d2620`, `ink-soft #3c4a40`, `paper #ece1cd`, `paper-deep #e3d5bb`, `paper-line #cdbf9f`, `pine #1c2620`, `pine-soft #27332b`, `brass #bb8b4b`, `brass-light #e9cd86`, `brass-deep #7d5826`. Tokens leben in `src/theme/` — keine Hex-Werte in Komponenten.
Fonts (gebundelt, nicht zur Laufzeit von Google geladen): Cormorant (Display/Ortsnamen), Hanken Grotesk (UI/Fließtext), Spline Sans Mono (Labels/Koordinaten, uppercase + letter-spacing).
Tonalität: Deutsch, warm, leicht poetisch („erwandert", „in Messing geprägt", „liegt noch im Nebel"). UI-Sprache ist Deutsch.

## Arbeitsweise

- Der Hauptagent ist **Orchestrator**: trifft finale Entscheidungen, integriert Änderungen.
- Subagents in `.claude/agents/` dienen **Analyse und Review**, nicht paralleler unkontrollierter Implementierung. Nach jedem Arbeitspaket den passenden Reviewer laufen lassen.
- Pro Arbeitspaket: erst Plan (in `docs/`), dann Implementierung im notwendigen Scope, dann Prüfung gegen die Akzeptanzkriterien aus dem Projektplan §11.
- Keine unnötigen Features, keine großen Architekturänderungen ohne dokumentierte Begründung.
- Unklare Entscheidungen: Annahme dokumentieren (im jeweiligen AP-Plan unter „Annahmen") und pragmatisch weitermachen.

## Coding-Regeln

- TypeScript strict; `npx tsc --noEmit` muss sauber sein.
- ESLint (`eslint-config-expo`) + Prettier; CI führt Lint + Typecheck (+ Tests, sobald vorhanden) aus.
- Komponenten klein und feature-nah (`src/features/...`), geteilte UI in `src/components/`.
- Keine Secrets im Repo. Client kennt nur den öffentlichen Supabase-Anon-Key (via `EXPO_PUBLIC_*`-Env, `.env` ist gitignored).
- Deutsche UI-Texte zentral sammeln (`src/i18n/de.ts` o. ä.), keine Hardcodes verstreuen.
- Commits klein und beschreibend; auf Branch `claude/...` arbeiten, nur nach Auftrag PRs erstellen.

## Befehle

```sh
npm run lint        # ESLint (expo lint)
npm run typecheck   # tsc --noEmit
npx expo start      # Dev-Server (Expo Go / Dev Client)
npx expo export --platform ios|android  # Bundle-Proxy für "App startet" in Cloud-Umgebungen
npm test            # Jest (jest-expo): Badge-Snapshots u. a.
```
