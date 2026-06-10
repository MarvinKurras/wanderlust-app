# AP1 — Projekt-Setup: Implementierungsplan

Status: **umgesetzt** (Typecheck/Lint grün, Export-Proxy iOS+Android erfolgreich, Design-Audit bestanden; QA-Abnahmebericht siehe Commit-Historie) · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP1)

## Ziel & Akzeptanzkriterien (aus dem Projektplan)

Expo + TypeScript + Expo Router + Lint/CI, Fonts gebundelt, Theme-Tokens aus dem Design-Inventar.

- [ ] App startet auf iOS & Android (in der Cloud-Umgebung: `expo export` für beide Plattformen als Proxy-Nachweis; Geräte-/Simulator-Test folgt lokal)
- [ ] Tabs (Karte, Orte, Sammlung) navigierbar
- [ ] Farben/Fonts entsprechen der Website

## Schritte

1. **Expo-App scaffolden** — `create-expo-app` mit TypeScript im Repo-Root, aktuelles Expo SDK. Aufräumen auf Minimal-Template (kein Beispiel-Code). `app.json`: Name „Wanderlust", Slug `wanderlust`, deutsche Locale, iOS `deploymentTarget` 16.4, Android `minSdkVersion` 26, vorläufiges App-Icon/Splash in Pine/Brass aus dem Website-Favicon-SVG abgeleitet (finale Icons sind AP9).
2. **Theme-Tokens** — `src/theme/colors.ts` (alle 10 Website-Tokens + Metallton-Gradienten aus `badges.js` `TONES`), `src/theme/typography.ts` (Font-Familien, Größenskala, Eyebrow-Stil: mono uppercase letter-spacing), `src/theme/spacing.ts`, `src/theme/index.ts`.
3. **Fonts bundeln** — Cormorant, Hanken Grotesk, Spline Sans Mono über `@expo-google-fonts/*`-Pakete (gebundelt, kein Laufzeit-Load). Laden via `useFonts` im Root-Layout mit Splash-Hold. Fallback, falls Pakete in der Netzwerk-Policy nicht installierbar sind: TTFs aus dem google/fonts-GitHub-Repo nach `assets/fonts/` + `expo-font`.
4. **Navigation** — Expo Router: `app/_layout.tsx` (Fonts, Theme, Stack), `app/(tabs)/_layout.tsx` (Tab-Bar in Paper/Pine-Stil mit Brass-Akzent), drei Platzhalter-Screens `karte.tsx`, `orte.tsx`, `sammlung.tsx` — jeweils nur Titel (Cormorant), Eyebrow (Spline Sans Mono) und korrekte Hintergrundfarbe als sichtbarer Token-Nachweis. Keine Feature-Logik.
5. **Qualitäts-Tooling** — ESLint (`eslint-config-expo`) + Prettier, Scripts `lint`, `typecheck` (`tsc --noEmit`); `.gitignore` (node_modules, .expo, .env); `.env.example` mit `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY`-Platzhaltern (Nutzung erst AP3).
6. **CI** — `.github/workflows/ci.yml`: bei Push/PR `npm ci`, `npm run lint`, `npm run typecheck`.
7. **Abnahme** — `tsc`, `lint`, `expo export` (ios + android) ausführen; `qa-acceptance-reviewer` und `website-design-auditor` laufen lassen; `CLAUDE.md`-Befehlssektion aktualisieren; commit + push.

## Explizit nicht in AP1

Supabase-Client/Backend (AP3), Badge-Renderer (AP2), Karte/`react-native-maps` (AP5), Standort-Permissions (AP6), State-Libs Zustand/TanStack Query (erst mit erstem echten Bedarf in AP3/AP4), Tests-Framework (kommt mit erster testbarer Logik, spätestens AP2-Badge-Snapshots), Onboarding (AP8).

## Annahmen

- A-AP1-1: `@expo-google-fonts`-Pakete enthalten die drei Schriften in den benötigten Schnitten (Cormorant 300–600 + Italic, Hanken Grotesk 300–700, Spline Sans Mono 400–600); sonst Fallback Schritt 3.
- A-AP1-2: npm-Registry ist aus der Umgebung erreichbar; sonst wird AP1 lokal nachgeholt und hier dokumentiert.
- A-AP1-3: „App startet" wird in der Cloud-Umgebung per `expo export`-Bundling beider Plattformen belegt; das ersetzt keinen Gerätetest.

## Risiken

- Expo-SDK-Major-Updates ändern Template-Details → Versionen in `package.json` pinnen.
- Tab-Bar-Styling auf beiden Plattformen konsistent halten → bewusst schlicht halten, Feinschliff in den Feature-APs.
