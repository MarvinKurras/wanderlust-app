# AP-R2 — Regionen sichtbar: Gruppierung & Abschluss-Marke

Status: **in Arbeit** · Folgeblock zu AP-R (AP9 weiter pausiert) · Branch: `claude/regionen-ui` (basiert auf main = AP1–AP8 + AP-R)

## Ziel & Akzeptanzkriterien

Regionen-Fortschritt wird in der App erlebbar; abgeschlossene Unterregionen erhalten eine Abschluss-Marke.

- [ ] Orte-Tab gruppiert nach Unterregion mit Fortschrittszeile („3 von 7 Zielen in Ladenburg erledigt"); Alt-Orte ohne Zuordnung unter „Weitere Ziele"; Filter funktionieren weiter
- [ ] Sammlung zeigt je Unterregion eine Abschluss-Marke: komplett = geprägt, sonst entsättigt mit Fortschritt
- [ ] Keine Schema-Änderungen; bestehende Screens/Flows unverändert bis auf die zwei Integrationen

## Schritte

1. **`StockBadge`**: optionale Prop `bandLabel` (Default bleibt `${elevationM} m`) — das untere Band kann „KOMPLETT" tragen; bestehende Badges/Snapshots unverändert.
2. **`RegionBadge`** (`src/features/collection/RegionBadge.tsx`): einheitliche Abschluss-Marke (oval · brass · Motiv `twin` — zwei Gipfel als Siegel), `locked` solange nicht komplett.
3. **Sektionen-Logik** (`src/features/places/sections.ts` + Tests): Orte nach Unterregion gruppieren (alphabetisch), `null`-Zuordnung → Fallback-Sektion.
4. **Orte-Tab**: FlatList → SectionList; Header je Sektion: Regionsname (Cormorant) + Fortschrittszeile aus `regionProgress` + „Komplett"-Zustand; Filter wirken innerhalb der Sektionen.
5. **Sammlung**: horizontale „Abschluss-Marken"-Reihe über dem Grid (alle Unterregionen mit Zielen; Fortschritts-Sublabel; komplett = volle Marke).
6. Checks, Design-Audit + QA, Push.

## Annahmen

- A-R2-1: Alt-Orte ohne `region_id` erscheinen unter **„Weitere Ziele"** (keine erfundene Regionszuordnung; echte Zuordnung ist Datenpflege).
- A-R2-2: **Einheitliches Siegel-Design** für alle Abschluss-Marken (oval/brass/twin, Band „KOMPLETT") — pro-Region-Konfiguration ist Ausbaustufe über spätere `regions`-Spalten, ohne Schema-Bruch.
- A-R2-3: Die Abschluss-Marke ist reine Ableitung aus `complete` (kein eigener Unlock-/DB-Eintrag) — kein Server-Vergaben-Flow nötig; manipulationsrelevant bleibt allein `unlocks`.

## Explizit nicht in AP-R2

Eigene Region-Detailseite, Karten-Gruppierung/Cluster, Eltern-Region-UI (nur Unterregionen sichtbar), Badge-Konfiguration in DB, AP9.
