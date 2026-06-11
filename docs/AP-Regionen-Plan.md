# AP-R — Regionen & Unterregionen (Ladenburg): Implementierungsplan

Status: **umgesetzt** (Checks grün; deployt; verify.mjs inkl. 4 neuer Regionen-Checks alle PASS) · Einschub zwischen AP8 und AP9 (AP9 pausiert) · Branch: `claude/regionen-ladenburg` (basiert auf main = AP1–AP8)

## Ziel & Akzeptanzkriterien

Orte können Regionen/Unterregionen zugeordnet werden; Fortschritt pro (Unter-)Region ist berechenbar; Ladenburg als erste Unterregion mit echten Hotspots.

- [x] Datenmodell: `regions` (selbstreferenzierend, beliebig tief erweiterbar) + `places.region_id`, RLS nach bestehendem Muster
- [x] Seed: Region Baden-Württemberg → Unterregion Ladenburg → 7 Hotspots mit echten Koordinaten
- [x] Fortschritt je Region/Unterregion berechenbar („3 von 8 Zielen in Ladenburg erledigt", `complete`-Flag) inkl. Roll-up auf die Elternregion — mit Unit-Tests
- [x] Bestehende Struktur unangetastet: Unlock-Flow, Screens und die 8 Alt-Orte funktionieren unverändert (`region_id` ist nullable)

## Entwurfsentscheidungen

- **Eine Tabelle `regions` mit `parent_id`** (selbstreferenzierend) statt zwei Tabellen Region/Unterregion: gleiche Mächtigkeit, weniger Schema, beliebig tief erweiterbar. Im MVP werden genau 2 Ebenen genutzt.
- **`places.region_id` nullable**: Die 8 Alt-Orte bleiben ohne Zuordnung gültig (Zuordnung zu echten Regionen ist ein späterer Datenpflege-Schritt). Das Anzeige-Feld `places.region` (Freitext) bleibt unverändert — `region_id` ist die strukturelle Wahrheit, `region` die Anzeige.
- **Fortschritt clientseitig berechnet** (`src/features/collection/regionProgress.ts`) aus den ohnehin geladenen `places` + `unlocks` — kein neuer Endpoint, offline-fähig über den bestehenden Query-Cache. Eltern-Fortschritt = Roll-up über alle Orte der Unterregionen.
- **Abschluss-Badge nur vorbereitet**: `complete`-Flag ist berechenbar; das besondere Abschluss-Badge selbst (Motiv/Vergabe) ist bewusst Ausbaustufe — `regions` kann dafür später um Badge-Spalten erweitert werden, ohne Migrationen der Kerntabellen.

## Annahmen

- A-R-1: **Stadthotspot-Radien 150–200 m** statt der Gipfel-Empfehlung 200–500 m (CLAUDE.md): Ladenburger Ziele liegen teils < 300 m auseinander; 250 m würde Mehrfach-Unlocks vom selben Standort provozieren. DB-Constraint (100–1000) deckt das ab; Abweichung hiermit dokumentiert.
- A-R-2: Koordinaten der 7 Hotspots sind sorgfältige Näherungen (OSM-Kenntnis) — in `docs/Koordinaten-Checkliste.md` ergänzt und vor Release zu verifizieren.
- A-R-3: Badge-Konfiguration nutzt die vorhandenen 6 Motive (kein neues „Stadt"-Motiv im Scope); `tower` für Bauwerke, `lake` für das Neckarufer, `forest` für den Benzpark.
- A-R-4: Keine UI-Änderungen in diesem Block — sichtbare Regionen-Gruppierung (Sammlung/Orte) ist der nächste Schritt, sobald die Grundlage abgenommen ist.

## Explizit nicht in diesem Block

UI-Gruppierung nach Regionen, Abschluss-Badge-Design/-Vergabe, Zuordnung der 8 Alt-Orte zu Regionen, AP9-Härtung.
