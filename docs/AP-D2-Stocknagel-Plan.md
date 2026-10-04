# AP-D2 — Stocknägel veredeln

**Status:** umgesetzt · Design-Review eingearbeitet (Gerätetest offen, siehe Release-Checkliste) · **Auslöser:** Nutzerwunsch (04.10.2026): „ein bisschen mehr Detail und etwas cleanere Linien … das sieht noch ein bisschen zu sehr wie für Kinder aus."

## Ausgangslage

Die Schilder (`src/badges/StockBadge.tsx`, `Scenery.tsx`) sind ein 1:1-Port von `wanderlust/badges.js` (AP2). In groß betrachtet (Galerie, Ort-Detail, Prägung) wirken sie wie Flat-Icons: große Dreiecke ohne Kontur, Sonne als Scheibe, keine Linienarbeit, Rahmen als weicher Farbverlauf. Dazu zwei echte Fehler:

- **Turm-Motiv:** Der Turm steht hinter dem Namensband, sichtbar bleibt nur ein grauer Stummel (Brocken, Wendelstein, alle Ladenburg-Orte).
- **Lange Namen** („Automuseum Dr. Carl Benz", „Carl-Benz-Haus & Benzpark", „Lobdengau-Museum") laufen über den Rand.

## Ziel

Die Schilder sollen wie echte gestanzte Stocknägel aussehen: Metallplakette mit Prägerand und Emaille-Feld (Cloisonné). Sie übernehmen die Kupferstich-Sprache der App-Bergketten, also feine Linien statt Flächen.

## Was bleibt (Kompatibilität)

- Umrisse, `VIEWBOX` (220 × 252), `CENTER`, Nietenpositionen: `BrassSheen`, `FogVeil` und `PlacePin` hängen daran.
- Die drei Formen, vier Metalltöne und sechs Motive bleiben, ebenso das Datenmodell. Es gibt keine Migration.
- Die Locked-Transformation `lockedColor` und die Gesamt-Opacity .62.
- Die APIs von `BadgeArt` und `StockBadge`.

## Was sich ändert

| Bereich | Neu |
|---|---|
| Rahmen | Gebürsteter Metallverlauf statt Kuppel-Radial. Erhabener Rand mit Licht- und Schattenkante, Perlrand (Perlschnur zwischen Rand und Feld) und eine eingesenkte Feldkante. |
| Nieten | Kleiner, kugelig, mit Glanzpunkt. |
| Namensband | Kartusche mit Licht- und Schattenkante. Gravierte Schrift mit Lichtkante. Eine Trennlinie mit Raute zwischen Name und Region. |
| Namen | Satz nach gemessener Laufweite (Cormorant 600). Bis zu zwei Zeilen, umbrochen an Leerzeichen oder Bindestrich. Die Schriftgröße passt sich der Breite der Form auf der jeweiligen Höhe an, mit Abstand zu den Nieten. |
| Region | Spline Mono, nie breiter als der Name (Hierarchie). Würde sie zu klein, bleibt nur der erste Teil: „LADENBURG · KURPFALZ" wird zu „LADENBURG". |
| Höhenband | Höhe in Spline Mono, flankiert von Rauten, wenn Platz ist. Im Schild sitzt die Grundlinie höher (219 statt 224), weil es unten spitz zuläuft. |
| Szenen | Konturstege in der Metallfarbe (Emaille-Look). Berge mit Licht- und Schattenflanke, Grat, gezacktem Schneefeld und Felsrinnen. Gipfelkreuz und Serpentinen-Pfad. Himmel mit Gravur-Schraffur, Sonne mit Strahlenkranz, Wasser mit Linien und Spiegelung. Tannen gestuft, Buchenkronen am Kreidefelsen. |
| Turm-Motiv | Steinturm mit Mauerwerk, Fensterschlitzen und Patina-Spitze, daneben ein Haus, auf einer Kuppe. Er steht vollständig unter dem Band. |
| Detailstufen | Ab 100 dp `detail`: Perlrand, Strahlen, Felsrinnen, Pfad, Kreuz, Rauten, Vögel, Region und Gravur-Lichtkante. Ab 140 dp `fine`: Haarlinien wie Himmels- und Flankenschraffur, Mauerwerk und Klüfte. Pins, Karussell und Liste bleiben so ruhig. |

## Technische Leitplanken

- Nur `react-native-svg`-Grundelemente: keine Filter, keine Patterns, kein `TextPath`.
- Linienbündel wie Schraffur, Strahlen und Rinnen werden je ein `Path`. Der Perlrand ist eine gestrichelte Kontur mit runden Kappen, also ein Element statt ~100 Kreise.
- Geometrie-Generatoren sind reine Funktionen in `src/badges/sceneryKit.ts`, der Namenssatz liegt in `src/badges/fitName.ts`. Beides ist getestet.
- Alle Farben laufen weiter über `cc()`, sodass Locked automatisch mitzieht. Die Szenen-Palette liegt als Token `badgeScene` in `src/theme/badgeScene.ts`. Hex-Werte stehen nur noch dort und in den unveränderten Metalltönen.
- `FIELD_SCALE` (0,88) ist einmal in `geometry.ts` definiert. Schild, Namenssatz und Glanz nutzen denselben Wert.
- Der Perlrand nutzt `strokeDasharray [0.3, 5.1]`. Echte Nulllängen verwirft Android auf manchen Pfaden, deshalb kurze Striche mit runden Kappen.

## Akzeptanzkriterien

1. Alle 15 Seed-Schilder wirken in der Galerie bei 240 dp detailreich und sauber konturiert. Kein Text läuft über den Rand, das Turm-Motiv ist vollständig sichtbar.
2. Bei 46–62 dp bleiben die Schilder lesbar und ruhig (Detailstufe greift).
3. Locked (Tag/Nacht), Glanz und Nebel funktionieren unverändert.
4. Typecheck, Lint und Tests sind grün. Die Snapshots sind bewusst aktualisiert, `fitName` und `sceneryKit` haben eigene Tests.
5. Die Web-Vorschau zeigt die neuen Schilder auf allen Screens. Ein Vorher/Nachher-Vergleich liegt dem Nutzer vor.
6. Der website-design-auditor hat geprüft: Tokens und Formen sind konform, die Abweichung der Szenen ist als Annahme dokumentiert.

## Annahmen

- **A-D2-1 Abweichung von der Website (Nutzerauftrag):** Die App-Schilder sind ab jetzt eine Weiterentwicklung von `badges.js`, kein Pixel-Port mehr. Die Website bleibt unverändert (read-only). Formen, Töne und Motiv-Zuordnung bleiben deckungsgleich, damit beide als dieselbe Marke erkennbar bleiben. Die CLAUDE.md wird entsprechend angepasst.
- **A-D2-2 Turm-Motiv generisch:** Das Motiv `tower` steht für Kirch-, Tor- und Aussichtsturm (Brocken, Wendelstein, Ladenburg). Eigene Motive wie Kirche, Stadttor oder Museum bräuchten eine Schema-Migration (`badge_motif`-Check). Das ist ein eigener Vorschlag und gehört nicht zu diesem AP.
- **A-D2-3 Laufweiten-Tabelle:** Die Zeichenbreiten von Cormorant 600 wurden im Browser mit der gebündelten Schrift gemessen (`measureText`, 100 px). Unbekannte Zeichen zählen mit 0,62 em. Spline Mono ist monospaced (0,6 em).
- **A-D2-4 Detailschwellen 100 / 140 dp:** Darunter wären die Feinheiten bzw. Haarlinien kleiner als ein Pixel und würden nur flimmern.
- **A-D2-5 Zwei Lichtrichtungen, bewusst getrennt:** In der Emaille-Szene steht die Sonne rechts oben, darum liegt die Schattenflanke links, auch bei Haus und Kapelle. Das Metall (Rahmenverlauf, Perlen- und Nietenglanz) ist dagegen wie auf der Website von links oben beleuchtet. Plakette und Bild wirken so wie zwei Materialien.
- **A-D2-6 Schrift-Fallback:** Lädt eine Schrift nicht (`fontError` im Root-Layout), stimmen die gemessenen Laufweiten nicht mehr. Das bleibt hingenommen, weil die Schriften gebündelt sind.
- **A-D2-7 Motiv-Inhalte:** `lake` zeigt die Kapelle von St. Bartholomä, auch bei der Neckarwiese. `tower` zeigt einen Steinturm statt Berg mit Mast (Brocken, Wendelstein). Eigene Motive sind als Folgeaufgabe vorgeschlagen (A-D2-2).

## Review (website-design-auditor) — eingearbeitet

- **Markenanker** (Umrisse, Nieten, Feld 0,88, Töne, Motivzuordnung, Schriften, Locked) sind deckungsgleich zur Website.
- **Behoben:**
  - Sonne und Gipfelkreuz beim Watzmann
  - Tannen am Schildrand
  - Turmknauf am Band
  - Höhenzahl ohne Rand im Schild
  - Region breiter als der Name
  - Haarlinien unter 1 px (Stufe `fine`)
  - Perlrand-Strich für Android
  - Schatten über `cc()`
  - Palette ins Theme
  - Vogelstrich 0,75
  - Schattenseiten an Haus und Kapelle
  - doppelte 0,88
  - Band-Label in Versalien
  - Schild-Label mit Status für Screenreader
  - Untergrenze 8,5 mit Extremfall-Tests
- **Offen (Gerätetest):** Perlrand und Schraffur auf Android 8 und aktuellen Geräten prüfen.
- **Aufgeräumt:** Die temporäre Galerie-Route und die Legacy-Kopie für den Vorher/Nachher-Vergleich sind gelöscht und waren nie committet.
