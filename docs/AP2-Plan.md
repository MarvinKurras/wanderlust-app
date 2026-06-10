# AP2 — Badge-Renderer: Implementierungsplan

Status: **umgesetzt** (Typecheck/Lint/Tests grün; Design-Audit: strukturell 1:1, nur dokumentierte Annahmen A-AP2-1…4) · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP2) · Branch: `claude/ap2-badge-renderer`

## Ziel & Akzeptanzkriterien

Portierung des Stockschild-Renderers aus `wanderlust/badges.js` nach `react-native-svg`: 3 Formen (shield/arch/oval), 4 Metalltöne (brass/silver/copper/pewter), 6 Motive (peak/twin/lake/cliff/forest/tower), Locked-Zustand.

- [x] Alle 8 Orte rendern pixel-treu zum Web (Side-by-side-Review; in der Cloud als Code-Review durch `website-design-auditor` gegen `badges.js`)
- [x] Locked-Variante vorhanden

## Schritte

1. `react-native-svg` installieren; Test-Framework `jest-expo` + `@testing-library/react-native` einrichten (statt `react-test-renderer`: liefert unter React 19 nur noch `null`-Bäume) (`npm test`, CI erweitern) — laut CLAUDE.md kommt das Test-Framework spätestens mit AP2.
2. `src/badges/`:
   - `geometry.ts` — viewBox 220×252, `CENTER`, `SHAPES`-Pfade, `NAILS`-Positionen (1:1 aus `badges.js`).
   - `Scenery.tsx` — die 6 gemalten Landschaftsszenen inkl. `snow`/`fir`-Helfern (1:1-Portierung der SVG-Fragmente).
   - `StockBadge.tsx` — Hauptkomponente: Metall-Gradienten (`badgeTones` aus dem Theme), Rahmen, Clip, Namens-/Höhenband, Gravur-Texte (zweilagig), Nieten, Innenrahmen; Props `{ name, region, elevationM, motif, shape, tone, locked?, width? }`.
3. Snapshot-Tests: alle 8 Orte (Badge-Konfigurationen aus dem Seed) + Locked-Variante.
4. Reviews: `website-design-auditor` (Pixel-Treue gegen `badges.js`) und `qa-acceptance-reviewer`; Typecheck/Lint/Tests; Commit/Push.

## Annahmen

- A-AP2-1: **Drop-Shadow** (`feDropShadow` in `badges.js`) wird nicht im SVG portiert — SVG-Filter sind in `react-native-svg` nicht zuverlässig. Der Schatten ist ein Außeneffekt und wird vom umgebenden View (Shadow/Elevation) geliefert, wo nötig (AP4/AP5/AP7).
- A-AP2-2: **Locked-Zustand**: Die Website nutzt CSS-Filter (`grayscale(.85) brightness(.62) opacity(.62)`), die es in `react-native-svg` nicht gibt. Approximation: Farb-Utility wendet Entsättigung + Abdunklung pro Farbe an (gleiche Parameter), plus Gesamt-Opacity 0.62. Visuelle Treue statt technischer Gleichheit.
- A-AP2-3: SVG-`Text` nutzt die in AP1 gebundelten Fonts (`Cormorant_600SemiBold`, `SplineSansMono_*`); Web-Fallbacks (`serif`/`monospace`) entfallen.
- A-AP2-4: Die „Side-by-side"-Abnahme erfolgt in der Cloud als struktureller Code-Vergleich (Pfade, Koordinaten, Farben, Schriftgrößen 1:1); echte visuelle Abnahme auf Gerät folgt beim nächsten lokalen Test.

## Explizit nicht in AP2

Verwendung des Badges in Screens (AP4/AP5/AP7), Unlock-Animation „Prägung" (AP6), Karten-Pin-Varianten (AP5).
