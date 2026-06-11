# AP7 — Sammlung: Implementierungsplan

Status: **in Arbeit** · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP7) · Branch: `claude/ap7-sammlung` (basiert auf main = AP1–AP6)

## Ziel & Akzeptanzkriterien

Wanderstock-/Grid-Ansicht, Fortschritt n/8, Freischaltdatum, Offline-Lesbarkeit aus Cache.

- [ ] Frisch freigeschalteter Badge erscheint sofort (Query-Invalidierung aus AP6 → gleiche `unlocks`-Query)
- [ ] Im Flugmodus bleibt die Sammlung sichtbar (persistierter Query-Cache)

## Schritte

1. **Query-Cache-Persistenz** (Projektplan §3 „AsyncStorage + Query-Cache"): `@tanstack/react-query-persist-client` + `query-async-storage-persister`; `PersistQueryClientProvider` im Root-Layout, `gcTime`/`maxAge` 7 Tage — Orte + eigene Unlocks sind damit offline lesbar (alle Tabs profitieren).
2. **Fortschritts-Logik** `src/features/collection/progress.ts` + Tests: „n / 8 erwandert", Subtexte aus `karte.html` (`updateProgress`): „Alle Gipfel erwandert — Sammlung komplett" / „Noch kein Gipfel erwandert — leg los" / „x Gipfel liegen noch im Nebel" (Singular/Plural).
3. **Sammlung-Tab** (`src/app/(tabs)/sammlung.tsx`): Pine-Welt nach Website `.collection` — Eyebrow brass-light „Dein Wanderstock", Cormorant-Titel, Fortschrittszeile mit Brass-Balken, 2-spaltiges Badge-Grid (`.coll-grid`-Mobile-Layout): frei = Badge + Name (#f3ead7) + „Erwandert am …" (Freischaltdatum); gesperrt = entsättigtes Badge + „Verschlossen" / „Noch nicht erwandert" (`.badge-card.locked`); Tap → `ort/[id]`; Pull-to-Refresh; Lade-/Fehlerzustand.
4. `PlaceholderScreen` entfernen (letzter Nutzer war die Sammlung).
5. Reviews (`website-design-auditor`, QA), Checks, Push.

## Annahmen

- A-AP7-1: „Wanderstock-Ansicht" wird als **Badge-Grid** umgesetzt (Website `.coll-grid`, 2 Spalten mobil). Die Stock-Szene mit überlappenden Schildern (`stickScene`) ist Landingpage-Dekoration und als Listen-UI unübersichtlich; ggf. Ausbaustufe.
- A-AP7-2: Offline-Lesbarkeit über persistierten TanStack-Query-Cache (7 Tage), nicht über eine eigene Offline-Datenbank — entspricht Projektplan §3. Erststart ohne Netz zeigt den Leerzustand (akzeptiert; es gibt dann auch keine Unlocks).
- A-AP7-3: Der Flugmodus-Nachweis erfolgt in der Cloud als Code-Beleg (Persistenz-Konfiguration + Cache-Restore); Gerätetest laut Testplan.

## Explizit nicht in AP7

Onboarding (AP8), Teilen/Social (Ausbaustufe), Regionen-Sets (Ausbaustufe), Stock-Szene mit überlappenden Badges (A-AP7-1).
