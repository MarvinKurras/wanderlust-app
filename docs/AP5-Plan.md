# AP5 — Kartenansicht: Implementierungsplan

Status: **in Arbeit** · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP5) · Branch: `claude/ap5-karte` (basiert auf main = AP1–AP4)

## Ziel & Akzeptanzkriterien

`react-native-maps`, Pins (Badge frei / Nebel+Schloss gesperrt), Bottom Sheet, eigener Standort, Ziel-Chips-Rail.

- [ ] Alle Orte korrekt positioniert (echte Geo-Koordinaten aus `places`)
- [ ] Tap → Sheet
- [ ] Fog-Optik entspricht der `karte.html`-Referenz

## Schritte

1. `react-native-maps` + `expo-location` installieren; iOS-Permission-String (`NSLocationWhenInUseUsageDescription`) und Android-Permissions in `app.json` (Texte erklären den Zweck, §10).
2. `src/features/map/`:
   - `region.ts` — Region-Berechnung, die alle Orte einschließt (Initialansicht Deutschland) + Unit-Test.
   - `PlacePin.tsx` — Marker-Inhalt: frei = Mini-Badge (≈49 dp wie `karte.html` `.pin .medal`) mit Stiel + Brass-Punkt; gesperrt = Nebel-Schleier (weißer Radial-Verlauf) mit Schloss-Icon und „? ? ?"-Label (Port der `.fog`/`.label-q`-Optik).
   - `PlaceSheet.tsx` — Bottom Sheet nach `karte.html`-Sheet: Badge, Eyebrow „Region · Koordinaten", Name, Meta, Status, CTA „Details ansehen" → `ort/[id]`; Scrim zum Schließen.
   - `ChipsRail.tsx` — horizontale Ziel-Chips (frei: Mini-Badge + Name/Höhe; gesperrt: Schloss + „Verschlossen / Noch im Nebel"), Tap zentriert die Karte und öffnet das Sheet.
3. Karte-Tab (`app/(tabs)/index.tsx`): MapView mit allen Orten, Locate-Button (Glass-Chip) — fragt Foreground-Permission on demand an und zeigt `showsUserLocation`; Ablehnung wird still toleriert (Priming/UX folgt AP6/AP8).
4. Reviews (`website-design-auditor`, `geolocation-reviewer`), Checks, QA, Push.

## Annahmen

- A-AP5-1: **Standardkarte ohne Custom-Styling** (verbindliche Entscheidung; Apple Maps auf iOS, Google auf Android). Die Marken-Optik kommt über Pins, Chips und Sheet in Paper/Glass-Tönen.
- A-AP5-2: **Android-Builds brauchen einen Google-Maps-API-Key** (`android.config.googleMaps.apiKey`); in Expo Go funktioniert die Karte ohne. Key wird erst für AP9-Builds benötigt → offener Punkt in `docs/Supabase-Setup.md`-Manier dokumentiert, kein Key im Repo.
- A-AP5-3: „Eigener Standort" = `showsUserLocation` nach on-demand Foreground-Permission über den Locate-Button. Vollständiges Permission-Priming und alle Fehlerpfade sind AP6/AP8.
- A-AP5-4: Bottom Sheet als leichte eigene Komponente (Animated + Scrim) statt zusätzlicher Dependency — ausreichend für ein nicht-dragbares Info-Sheet.
- A-AP5-5: Kein Fog-Slider/Tageszeit-Tint aus `karte.html` (Demo-Spielereien, nicht MVP).

## Explizit nicht in AP5

Unlock-Flow/Distanzprüfung (AP6), Prägung-Animation (AP6), Sammlung (AP7), Onboarding/Permission-Priming (AP8), gemalte Karte (Ausbaustufe).
