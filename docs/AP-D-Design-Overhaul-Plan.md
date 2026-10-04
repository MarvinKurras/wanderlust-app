# AP-D — Design-Overhaul: Die Marke veredeln

Status: **in Arbeit** · Auftrag: Overhaul „wie bei der Spielesammlung" (Tavernen-Redesign, `spielesammlung@9836eaa`) — Entscheidungen des Nutzers: **Marke veredeln** (kein neuer Look), **Standardkarte gestylt** (keine gemalte Karte), **Web-Vorschau** für Zwischenstände · Branch: `claude/jolly-knuth-wvxyhk` (basiert auf AP-R3 + SDK 57)

## Ziel

Gleicher Stack, gleiche Daten, gleiche Flüsse — aber jeder Screen fühlt sich an wie die Website in Bewegung: Pergament, Tannengrün und Messing werden lebendig (wandernder Nebel, Messingglanz, der der Handyneigung folgt, Prägung mit spürbarer Haptik, Berge, die sich selbst skizzieren). Die Freischalt-Logik (Edge Function, RLS, §9-Regel) bleibt unangetastet.

## Akzeptanzkriterien

- [ ] Design-System als wiederverwendbare Bausteine in `src/components/` + `src/lib/` (Motion, Haptik, Neigung, Glas, Pressables, Buttons, Glyphen, Messingglanz, Atmosphäre, Screen-Gerüst, Sheet, Dialog, Tab-Bar)
- [ ] Alle Screens im neuen Look: Karte, Orte, Ort-Detail inkl. Prägung, Sammlung, Onboarding, Einstellungen, Rechtliches
- [ ] Prägung als inszenierter Moment (Schläge mit Haptik, Nebel weicht, Ring, Funken, Glanz) — Ergebnis kommt weiterhin ausschließlich vom Server
- [ ] Farben/Fonts bleiben die Website-Tokens (`src/theme/`), keine Hex-Werte in Komponenten; Badges bleiben pixel-treu (inkl. Nachzug der Website-Vögel aus `wanderlust@37ab2db`)
- [ ] „Bewegung reduzieren" wird überall respektiert (keine Dauerschleifen, keine Parallaxe)
- [ ] Web-Vorschau baut (`expo export --platform web`) und zeigt alle Screens mit Vorschau-Daten; Screenshots geprüft
- [ ] typecheck, lint, Tests grün; `expo export` iOS + Android grün
- [ ] Reviews: website-design-auditor, mobile-architecture-reviewer, security-privacy-reviewer (Vorschau-Modus), qa-acceptance-reviewer

## Design-Prinzipien

1. **Marke vor Effekt** — jede Bewegung hat ein Vorbild auf der Website (Skizzen-Intro, Nebel, Glanz-Sweep, Pop + Ring) oder in der Stocknagel-Welt (Prägen, Hammerschlag, Messing).
2. **Zwei Welten** — Pergament (Karte, Orte, Detail, Onboarding, Einstellungen) und Tannen-Nacht (Sammlung = Vitrine).
3. **Weniger Text** (Lehre aus dem Spielesammlungs-Feinschliff): keine Untertitel, die nichts sagen; Status als Zeichen + kurzes Wort.
4. **Ruhig statt zappelig** — Dauerschleifen langsam (≥ 20 s), Interaktionen knackig (Federn aus `lib/motion.ts`).
5. **Eigene Glyphen statt Standard-Icons** — Linien-Icons im Strich der Website-„So funktioniert's"-Icons (1,6 px, runde Enden).

## Bausteine

| Baustein | Wofür | Vorbild |
|---|---|---|
| `lib/motion.ts` | Federn/Dauern zentral | Spielesammlung |
| `lib/haptics.ts` | tick/impact/success + Präge-Choreografie | Spielesammlung |
| `lib/tilt.tsx` | ein Neigungssensor für Parallaxe und Glanz | Spielesammlung |
| `GlassSurface` | Liquid Glass (iOS 26) bzw. Pergament-Glas mit Blur | `karte.html --glass` |
| `PressableScale`, `Button` | Federndes Drücken mit Haptik; Varianten ink / brass (geprägt) / outline / ghost | Website-Pills |
| `Glyph` | eigenes SVG-Icon-Set | Website-Icons |
| `BrassSheen` | Metallglanz als Skia-Shader, folgt der Neigung, exakt auf der Schildform; Web: SVG-Sweep | Website-Glanz-Sweep (`glint_`) |
| `Atmosphere` | Bühne: Himmel, 6 Bergketten der Website, Nebelbänder, Wolken, Vögel, Korn; Varianten paper / pine / dawn (Skizzen-Intro) | Website-Hero |
| `FogVeil` | wandernder Nebel über verschlossenen Schildern | `karte.html .fog` |
| `Screen` | Gerüst: großer Titel, der beim Scrollen in die Glas-Kopfleiste wandert | Spielesammlung |
| `BottomSheet`, `Dialog` | wischbares Sheet; app-eigener Bestätigungsdialog statt `Alert` | Spielesammlung |
| `TabBar` | schwebende Glas-Leiste mit Glyphen | — |
| `PraegeMoment` | Vollbild-Inszenierung der Freischaltung | `map/app.js` Pop + Ring |

## Neue Abhängigkeiten (Begründung)

- `@shopify/react-native-skia` — Shader für den Messingglanz (in RN-SVG nicht möglich); nur nativ geladen (`.native.tsx`), Web nutzt SVG-Fallback.
- `expo-glass-effect`, `expo-blur` — Liquid Glass auf iOS 26 bzw. Blur-Fallback für die Glas-Chips der Karte.
- `expo-haptics` — Haptik der Prägung und der Bedienelemente.
- `expo-linear-gradient` — Verläufe für Glas, Buttons, Nebel (performanter als SVG-Verläufe in Listen).
- entfällt: `@expo/vector-icons` (ersetzt durch `Glyph`).

## Web-Vorschau

- `react-native-web` (seit SDK-57-Commit installiert). Die Karte (`react-native-maps`) hat kein Web: `WorldMap.web.tsx` zeichnet eine Pergament-Projektion mit Gradnetz und Pins.
- **Vorschau-Daten** (`src/lib/preview.ts`): nur wenn `Platform.OS === 'web'` **und** `EXPO_PUBLIC_PREVIEW=1` gesetzt ist. Dann liefern die Datenfunktionen lokale Kopien der Seed-Daten, und „Prägen" simuliert den Ablauf, ohne Netz. In nativen Builds ist der Pfad tot (Plattform-Gate); der Server bleibt die einzige Instanz, die echte Unlocks schreibt.

## Annahmen

- A-D-1: Bergketten, Himmelstöne, Wolken und Vögel werden aus `wanderlust/app.js`/`index.html` portiert (Pfade 1:1, Farben als Tokens `landscape` in `src/theme/`). Website-Hex-Werte, die bisher nur in der Website-Bühne vorkommen, werden damit Teil der App-Tokens.
- A-D-2: Korn-Overlay als kachelbares PNG (einmal per Skript erzeugt) statt SVG-`feTurbulence` — Filter sind in RN-SVG nicht verlässlich (vgl. A-AP2-1).
- A-D-3: iOS-Karte nutzt `mapType="mutedStandard"` (Apple-Karten lassen sich nicht frei stylen); Android bekommt einen Pergament-`customMapStyle`. Das bleibt „Standardkarte" im Sinne der verbindlichen Entscheidung.
- A-D-4: Pins bleiben statisch (`tracksViewChanges={false}`, Android rendert Marker als Snapshot); Bewegung findet in Karussell, Sheet und Präge-Zone statt.
- A-D-5: Der Glanz liegt nur auf erwanderten Schildern; verschlossene tragen Nebel. Das hält die Zahl der Skia-Canvases klein.

## Explizit nicht in AP-D

Gemalte Karte (MapLibre), neue Features, Backend-/Schema-Änderungen, Änderungen an der Unlock-Regel, Store-Assets.
