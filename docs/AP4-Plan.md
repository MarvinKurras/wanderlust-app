# AP4 — Ortsliste & Detail: Implementierungsplan

Status: **umgesetzt** (alle Checks grün; Architektur-Review konform; Design-Audit-Findings behoben; QA: „AP abnehmbar") · Quelle: `docs/Wanderlust-App-Projektplan.md` §11 (AP4) · Branch: `claude/ap4-orte-detail` (basiert auf AP2)

## Ziel & Akzeptanzkriterien

Liste mit Badge, Status, Filter; Detail-Screen mit Beschreibung, Koordinaten, Entfernung, Status.

- [x] Beide Screens mit Live-Daten (Supabase `places` + eigene `unlocks`)
- [x] Locked/Unlocked korrekt (Badge-Optik + Statuszeile)
- [x] Pull-to-Refresh

## Schritte

1. **TanStack Query** einführen (laut Projektplan §3 Server-State; erster echter Bedarf): `QueryClientProvider` im Root-Layout, Hooks `usePlaces` / `useUnlocks` (`ensureSession()` vor `unlocks`-Query).
2. **Datenschicht ergänzen:** `src/lib/unlocks.ts` (`Unlock`-Typ, `fetchUnlocks()`), `src/lib/format.ts` (Koordinaten als `47°25′N 10°59′O` wie Website, deutsches Datum „19. Juli 2024") + Unit-Tests.
3. **UI-Texte zentralisieren:** `src/i18n/de.ts` (CLAUDE.md-Regel), Tonalität der Website.
4. **Orte-Tab:** Liste aller Orte (FlatList, Pull-to-Refresh), Karte je Ort mit kleinem `StockBadge` (locked entsprechend), Name (Cormorant), Mono-Meta „Höhe · Region", Status-Pip; Filter-Chips „Alle / Noch offen / Erwandert"; Lade-/Fehler-/Leerzustände.
5. **Ort-Detail:** Route `ort/[id]` im Root-Stack; Aufbau nach Website-Detail-Modal (`badges.js` `openModal` / `karte.html` Sheet): dunkles Art-Panel mit großem Badge, Eyebrow „Region · Koordinaten", Name, Mono-Meta „Höhe · Typ", Beschreibung, Statuszeile (erwandert am … / noch nicht erwandert), deaktivierter Shop-Teaser „Als Stocknagel bestellen — bald verfügbar" (verbindliche Entscheidung), Link-Platz für Unlock-Flow (AP6).
6. Reviews (`mobile-architecture-reviewer` + `website-design-auditor`), Checks, QA-Abnahme, Push.

## Annahmen

- A-AP4-1: **Entfernungsanzeige** im Detail erfordert Standortzugriff, der laut Projektplan erst mit AP6 (Permission-Handling, `expo-location`) kommt. Im Detail ist der Platz dafür vorgesehen; die Anzeige selbst wird in AP6 ergänzt. Das AP4-Kriterium „Entfernung" gilt damit als vorbereitet, nicht final.
- A-AP4-2: Unlock-Status kommt aus der eigenen `unlocks`-Tabelle (RLS). Solange es keinen Unlock-Flow gibt (AP6), sind real alle Orte „verschlossen" — Logik und Optik für „erwandert" sind implementiert und getestet (Mock).
- A-AP4-3: Datum „Erwandert am …" wird manuell deutsch formatiert (Monatsnamen-Tabelle) statt über `Intl`, um identisches Verhalten auf Hermes/Android, iOS und in Jest zu garantieren.
- A-AP4-4: Koordinaten-Anzeige im Website-Format (Grad/Minuten, `O` für Ost) aus `lat`/`lng` berechnet.

## Explizit nicht in AP4

Unlock-Flow/Standortmessung (AP6), Kartenansicht (AP5), Sammlung (AP7), Onboarding (AP8), Zustand-Store (kein Client-State-Bedarf).
