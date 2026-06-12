# AP-R3 — Karten-UX: Regionen erlebbar, Orte erreichbar

Status: **umgesetzt** · Folgeblock zu AP-R/AP-R2 · Branch: `claude/keen-mccarthy-x8y7w2` (basiert auf main = AP1–AP9 + AP-R/R2)

## Ziel & Akzeptanzkriterien

Die Karte macht Regionen als zusammengehörige Gebiete sichtbar und hilft beim Hinkommen — produktionsreif statt Test-Gefühl.

- [x] Regionen-Leiste auf der Karte: „Alle Ziele" + jede Region/Unterregion mit Zielen (Baden-Württemberg, Ladenburg) + „Weitere Ziele"; Auswahl zoomt die Karte passgenau auf das Gebiet und filtert die Ziel-Karten
- [x] Zoom-Verhalten repariert: Fokus auf einen Stadthotspot zoomt auf Stadt-Niveau (skaliert mit `unlock_radius_m`), nicht mehr auf ~66 km; Regionen-Zoom umschließt die Ziele eng
- [x] Ziel-Karussell statt loser Chip-Leiste: einrastende Karten (Snap), Wischen fokussiert den Ort auf der Karte, Pin-Tap scrollt zur Karte — Karte und Karussell bleiben synchron
- [x] „Wie komme ich dahin": Luftlinien-Distanz auf Karten und im Sheet (sobald Standort freigegeben), „Route"-Button öffnet Apple/Google Maps mit Fußweg-Navigation
- [x] Präge-Zone sichtbar: Der ausgewählte Ort zeigt seinen Freischalt-Radius als Messing-Ring auf der Karte
- [x] Orte-Tab: Sektionen zeigen die Elternregion als Eyebrow („Baden-Württemberg" über „Ladenburg")
- [x] Keine Schema-Änderungen, kein neues Tracking: Standort weiter nur Foreground/on demand; ohne erteilte Permission keine Distanzanzeige und kein automatischer Standort-Abruf

## Entwurfsentscheidungen

- **Regionen-Filter generisch** (`src/features/map/regionFilter.ts`): Optionen werden aus `regions` + `places` abgeleitet (Roll-up über Unterregionen, Eltern vor Kindern, nur Regionen mit Zielen). Neue Regionen erscheinen ohne Codeänderung.
- **Distanz clientseitig** über das vorhandene `haversineM` — reine Anzeige, die Unlock-Entscheidung bleibt serverseitig (Edge Function).
- **Route über System-Karten-App** (Apple Maps / Google Maps Web-Intent, Fußweg): keine eigene Routing-Abhängigkeit im MVP.
- **Karussell mit `snapToInterval`** statt Paging-Library: kein neues Package, deterministisches Verhalten.

## Annahmen

- A-R3-1: **Ortsnamen sind im Karussell auch verschlossen sichtbar** (Status bleibt „Noch im Nebel", Pin bleibt Nebel-Schleier). Begründung: Orte-Tab und Karten-Sheet zeigen die Namen bereits; ohne Namen ist „wie komme ich dahin" unmöglich. Der Nebel bleibt als Zustand, nicht als Geheimhaltung.
- A-R3-2: Ist die Standort-Permission bereits erteilt, liest die Karte beim Öffnen einmalig die letzte bekannte Position für die Distanzanzeige (Foreground, kein Abo, kein neuer Prompt). Erstabfrage weiterhin nur über den Standort-Button bzw. Onboarding.
- A-R3-3: Fokus-Zoom skaliert mit `unlock_radius_m` (Stadtziel 150 m ≈ 2-km-Ausschnitt, Gipfel 500 m ≈ 8 km), geklemmt auf 0,012–0,08°.
- A-R3-4: Die Regionen-Leiste zeigt die Hierarchie als Reihenfolge (Eltern vor Unterregionen) mit Fortschrittszähler statt Einrückung — bei zwei Ebenen ausreichend, tiefere Bäume bleiben korrekt sortiert.
- A-R3-5: Locate-Button und Positions-Read scheitern **still** (keine Distanzanzeige als Fallback); der volle Fehler-Flow mit Settings-Link aus §9 gehört zum Unlock, nicht zur Kartenanzeige. Distanz-Read nutzt bewusst `Accuracy.Balanced` — die Unlock-Messung (`Accuracy.High`) bleibt allein in `useUnlock.ts`.
- A-R3-6: Locked-Statustexte bewusst unterschiedlich: Karussell kompakt „Noch im Nebel", Sheet ausführlich „Noch nicht erwandert" (beide zentral in `de.ts`). Der Outline-Pill „Route" im Sheet ist eine bewusste Pattern-Erweiterung ohne Website-Pendant (Funktion existiert auf der Website nicht), token-treu in Ink/Mono.

## Explizit nicht in AP-R3

Eigene Region-Detailseite, Marker-Clustering, echtes Routing in der App, Offline-Karten, Backend-Änderungen.
