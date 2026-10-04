# AP-D — Design-Overhaul: Die Marke veredeln

Status: **umgesetzt** (Gerätetests offen, siehe Release-Checkliste) · Auftrag: Overhaul „wie bei der Spielesammlung" (Tavernen-Redesign, `spielesammlung@9836eaa`) — Entscheidungen des Nutzers: **Marke veredeln** (kein neuer Look), **Standardkarte gestylt** (keine gemalte Karte), **Web-Vorschau** für Zwischenstände · Branch: `claude/jolly-knuth-wvxyhk` (basiert auf AP-R3 + SDK 57)

## Ziel

Gleicher Stack, gleiche Daten, gleiche Flüsse — aber jeder Screen fühlt sich an wie die Website in Bewegung: Pergament, Tannengrün und Messing werden lebendig (wandernder Nebel, Messingglanz, der der Handyneigung folgt, Prägung mit spürbarer Haptik, Berge, die sich selbst skizzieren). Die Freischalt-Logik (Edge Function, RLS, §9-Regel) bleibt unangetastet.

## Akzeptanzkriterien

- [x] Design-System als wiederverwendbare Bausteine in `src/components/` + `src/lib/` (Motion, Haptik, Neigung, Glas, Pressables, Buttons, Glyphen, Messingglanz, Atmosphäre, Screen-Gerüst, Sheet, Dialog, Tab-Bar)
- [x] Alle Screens im neuen Look: Karte, Orte, Ort-Detail inkl. Prägung, Sammlung, Onboarding, Einstellungen, Rechtliches
- [x] Prägung als inszenierter Moment (Schläge mit Haptik, Nebel weicht, Ring, Funken, Glanz) — Ergebnis kommt weiterhin ausschließlich vom Server
- [x] Farben/Fonts bleiben die Website-Tokens (`src/theme/`), keine Hex-Werte in Komponenten; Badges pixel-treu inkl. Website-Vögel (`wanderlust@37ab2db`) — danach auf Nutzerwunsch in AP-D2 bewusst veredelt (`docs/AP-D2-Stocknagel-Plan.md`)
- [x] „Bewegung reduzieren" wird überall respektiert (keine Dauerschleifen, keine Neigungs- und keine Scroll-Parallaxe; Prägung ohne Schläge, Erfolgs-Haptik bleibt)
- [x] Web-Vorschau baut (`expo export --platform web`) und zeigt alle Screens mit Vorschau-Daten; Screenshots geprüft
- [x] typecheck, lint, Tests grün; `expo export` iOS + Android grün
- [x] Reviews: website-design-auditor, mobile-architecture-reviewer, security-privacy-reviewer (Vorschau-Modus), geolocation-reviewer, qa-acceptance-reviewer — Ergebnisse unten

## Design-Prinzipien

1. **Marke vor Effekt** — jede Bewegung hat ein Vorbild auf der Website (Skizzen-Intro, Nebel, Glanz-Sweep, Pop + Ring) oder in der Stocknagel-Welt (Prägen, Hammerschlag, Messing).
2. **Zwei Welten** — Pergament (Karte, Orte, Detail, Onboarding, Einstellungen) und Tannen-Nacht (Sammlung = Vitrine).
3. **Weniger Text** (Lehre aus dem Spielesammlungs-Feinschliff): keine Untertitel, die nichts sagen; Status als Zeichen + kurzes Wort.
4. **Ruhig statt zappelig** — Bühnen-Schleifen langsam (Wolken, Vögel, Nebelbänder ≥ 20 s; Nebel über Schildern 9–12,5 s wie die Website-Schwaden), Interaktionen knackig (Federn aus `lib/motion.ts`). Alle Schleifen pausieren, wenn ihr Screen nicht sichtbar ist.
5. **Eigene Glyphen statt Standard-Icons** — Linien-Icons im Strich der Website-„So funktioniert's"-Icons (1,6 px, runde Enden).

## Bausteine

| Baustein | Wofür | Vorbild |
|---|---|---|
| `lib/motion.ts` | Federn/Dauern zentral | Spielesammlung |
| `lib/haptics.ts` | tick/impact/success + Präge-Choreografie | Spielesammlung |
| `lib/tilt.tsx` | ein Neigungssensor für Parallaxe und Glanz — läuft nur mit sichtbarem Konsumenten, ~30 Hz, Deadband | Spielesammlung |
| `lib/screenActive.ts` | `useScreenActive`: Schleifen pausieren auf verdeckten Screens / im Hintergrund | — |
| `GlassSurface` | Liquid Glass (iOS 26) bzw. Pergament-Glas mit Blur | `karte.html --glass` |
| `PressableScale`, `Button` | Federndes Drücken mit Haptik; Varianten ink / brass (geprägt) / outline / ghost | Website-Pills |
| `Glyph` | eigenes SVG-Icon-Set | Website-Icons |
| `BrassSheen` (`src/badges/`) | Metallglanz als Skia-Shader, folgt der Neigung, auf der 0,88-Fläche wie die Website; Web: SVG-Sweep | Website-Glanz-Sweep (`glint_`) |
| `Atmosphere` | Bühne: Himmel, 6 Bergketten der Website, Nebelbänder, Wolken, Vögel, Korn; Varianten paper / pine / dawn (Skizzen-Intro) | Website-Hero |
| `FogVeil` (`src/badges/`), `BadgeArt` | wandernder Nebel über verschlossenen Schildern; in Liste/Karussell stehend | `karte.html .fog` |
| `ScreenChrome` (`LargeTitle`, `CompactHeader`) | Gerüst: großer Titel, der beim Scrollen in die Glas-Kopfleiste wandert | Spielesammlung |
| `BottomSheet`, `ConfirmDialog` | wischbares Sheet; app-eigener Bestätigungsdialog statt `Alert` | Spielesammlung |
| `FocusStatusBar` | Statusleisten-Stil nur für den sichtbaren Screen (hell auf Tannen-Nacht) | — |
| `TabBar` | schwebende Glas-Leiste mit Glyphen | — |
| `PraegeMoment` | Vollbild-Inszenierung der Freischaltung | `map/app.js` Pop + Ring |

## Neue Abhängigkeiten (Begründung)

- `@shopify/react-native-skia` — Shader für den Messingglanz (in RN-SVG nicht möglich); nur nativ geladen (`.native.tsx`), Web nutzt SVG-Fallback.
- `expo-glass-effect`, `expo-blur` — Liquid Glass auf iOS 26 bzw. Blur-Fallback für die Glas-Chips der Karte.
- `expo-haptics` — Haptik der Prägung und der Bedienelemente.
- `expo-linear-gradient` — Verläufe für Glas, Buttons, Nebel (performanter als SVG-Verläufe in Listen).
- `expo-dev-client` — Development-Build (`eas.json` Profil `development`); Expo Go kann Skia/Glass nicht.
- `react-dom`, `@expo/metro-runtime` (mit `react-native-web`) — nur für die Web-Vorschau.
- entfällt: `@expo/vector-icons` (ersetzt durch `Glyph`).

## Web-Vorschau

- `react-native-web` (seit SDK-57-Commit installiert). Die Karte (`react-native-maps`) hat kein Web: `WorldMap.web.tsx` zeichnet eine Pergament-Projektion mit Gradnetz und Pins.
- **Vorschau-Daten**: Plattform-Split. `src/lib/preview.ts` ist die native Fassung (`isPreview = false`, Stubs werfen, keine Seed-Kopien im Bundle); `src/lib/preview.web.ts` ist die echte Implementierung und gilt nur mit `EXPO_PUBLIC_PREVIEW=1` (jede Funktion prüft `assertPreview()`). Dann liefern die Datenfunktionen lokale Kopien der Seed-Daten (`previewData.ts`, erzeugt per `npm run preview:data`), „Prägen" simuliert den Ablauf ohne Netz, Konto-Aktionen sind kurzgeschlossen, der Query-Cache hat einen eigenen `buster`. Ein echter Web-Build prägt nicht (`de.unlock.nurApp`). Der Server bleibt die einzige Instanz, die echte Unlocks schreibt (`src/lib/__tests__/preview.test.ts`).

## Annahmen

- A-D-1: Bergketten, Himmelstöne, Wolken und Vögel werden aus `wanderlust/app.js`/`index.html` portiert (Pfade 1:1, Farben als Tokens `landscape` in `src/theme/`). Website-Hex-Werte, die bisher nur in der Website-Bühne vorkommen, werden damit Teil der App-Tokens.
- A-D-2: Korn-Overlay als kachelbares PNG (einmal per Skript erzeugt) statt SVG-`feTurbulence` — Filter sind in RN-SVG nicht verlässlich (vgl. A-AP2-1).
- A-D-3: iOS-Karte nutzt `mapType="mutedStandard"` (Apple-Karten lassen sich nicht frei stylen); Android bekommt einen Pergament-`customMapStyle`. Das bleibt „Standardkarte" im Sinne der verbindlichen Entscheidung.
- A-D-4: Pins bleiben statisch (`tracksViewChanges={false}`, Android rendert Marker als Snapshot); Bewegung findet in Karussell, Sheet und Präge-Zone statt.
- A-D-5: Der Glanz liegt nur auf erwanderten Schildern; verschlossene tragen Nebel. In der Orte-Liste und im Karussell gibt es keinen Glanz und stehenden Nebel; der Skia-Shader läuft ohne Uhr und zeichnet nur bei Neigungsänderung.
- A-D-6: Entfernungsanzeige (Karte, Sheet, Karussell, Detail) liest bei bereits erteilter Permission einmal pro Screen-Fokus die letzte bekannte Position (≤ 5 min, ≤ 1 km) bzw. misst einmal mit `Accuracy.Balanced` (10 s Timeout). Kein Abo, nichts verlässt das Gerät. Texte (Priming, Datenschutz, iOS-String, Store) nennen das.
- A-D-7: Der Lagesensor (Reanimated `ROTATION`) wird nur lokal für Glanz/Parallaxe gelesen, braucht keine Berechtigung und steht transparent im Datenschutztext.
- A-D-8: `mapPaint`-Tokens (Web-Vorschau-Karte, `src/theme/mapStyle.ts`) stammen aus `wanderlust/map/terrain.js`; nur Vorschau.
- A-D-9: Die 15 Vorschau-Orte entsprechen den Seed-Migrationen (8 Gipfel + 7 Ladenburg); 6 gelten als erwandert, damit beide Zustände sichtbar sind.
- A-D-10: `WorldMap.web.tsx` ist die einzige eigene Kartendarstellung — ausschließlich Web-Vorschau, nie nativ (CLAUDE.md).
- A-D-11: Bekannte Abweichung Android 8–11: `filter: drop-shadow` (Schilder) erst ab Android 12, `boxShadow` ab Android 9 — dort fehlen die Schatten still (kein Crash). Gerätetest entscheidet, ob ein statischer Fallback nötig ist.

## Review-Ergebnisse (alle ohne Blocker)

| Review | Kernbefunde | Umgesetzt in |
|---|---|---|
| mobile-architecture | Schleifen auf verdeckten Tabs, Skia-Uhr, Sensor app-weit, Blur-/Listenlast, Preview-Split, Compiler-Bailouts, Modals Edge-to-Edge | Performance-Commit (`useScreenActive`, Sensor nach Bedarf, Skia ohne Uhr, virtualisierte Sammlung, Plattform-Split, try/finally entfernt, `navigationBarTranslucent`) |
| geolocation | Offline bei abgelaufener Session, Doppeltipp, Verlassen während Messung, Mock-Flag, ungefährer Standort, veraltete Position, `ALREADY_UNLOCKED` ohne Inszenierung | Unlock-Commit + Positions-Hook |
| security-privacy | Texte (Priming, Datenschutz, iOS-String, Store) decken Entfernungsanzeige nicht ab; Preview-Absicherung; Checkliste | dieser Doku-Commit, `preview.test.ts`, Release-Checkliste |
| website-design-auditor | Statusleiste, Sonnen-Halo, Parallaxe-Amplitude, Messing-Button im Web, Reduced Motion bei Scroll, Fortschritts-Farben, „Gipfel"-Wortwahl, Sheet-Status, Schatten-Skalierung, Glyph `visit` | Design-Commit; Schatten-Skalierung siehe AP-D2 |
| qa-acceptance | abnehmbar mit Auflagen: Statusleiste, Shader-`pow`, Reduced-Motion-Lücke, Doku | alle erledigt |

## Explizit nicht in AP-D

Gemalte Karte (MapLibre), neue Features, Backend-/Schema-Änderungen, Änderungen an der Unlock-Regel, Store-Assets.
