# AP-D2 — Stocknägel veredeln

**Status:** umgesetzt (Design-Review läuft) · **Auslöser:** Nutzerwunsch (04.10.2026): „ein bisschen mehr Detail und etwas cleanere Linien … das sieht noch ein bisschen zu sehr wie für Kinder aus."

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
| Namen | Satz nach gemessener Laufweite (Cormorant 600). Bis zu zwei Zeilen, umbrochen an Leerzeichen oder Bindestrich. Die Schriftgröße passt sich der Breite der Form auf der jeweiligen Höhe an. |
| Höhenband | Höhe in Spline Mono, flankiert von Rauten, wenn Platz ist. |
| Szenen | Konturstege in der Metallfarbe (Emaille-Look). Berge mit Licht- und Schattenflanke, Grat, gezacktem Schneefeld und Felsrinnen. Gipfelkreuz und Serpentinen-Pfad. Himmel mit Gravur-Schraffur, Sonne mit Strahlenkranz, Wasser mit Linien und Spiegelung. Tannen gestuft, Buchenkronen am Kreidefelsen. |
| Turm-Motiv | Steinturm mit Mauerwerk, Fensterschlitzen und Patina-Spitze, daneben ein Haus, auf einer Kuppe. Er steht vollständig unter dem Band. |
| Detailstufe | Unter 100 dp Breite entfallen Feinheiten wie Schraffur, Perlrand, Strahlen, Felsrinnen, Pfad, Kreuz und Rauten. Pins, Karussell und Liste bleiben ruhig. |

## Technische Leitplanken

- Nur `react-native-svg`-Grundelemente: keine Filter, keine Patterns, kein `TextPath`.
- Linienbündel wie Schraffur, Strahlen und Rinnen werden je ein `Path`. Der Perlrand ist eine gestrichelte Kontur mit runden Kappen, also ein Element statt ~100 Kreise.
- Geometrie-Generatoren sind reine Funktionen in `src/badges/sceneryKit.ts`, der Namenssatz liegt in `src/badges/fitName.ts`. Beides ist getestet.
- Alle Farben laufen weiter über `cc()`, sodass Locked automatisch mitzieht. Hex-Werte bleiben auf `src/badges/` beschränkt (Badge-Kunst, wie bisher).

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
- **A-D2-4 Detailschwelle 100 dp:** Darunter wären die Feinheiten kleiner als ein Pixel und würden nur flimmern.
- **A-D2-5 Lichtrichtung von rechts oben:** Die Sonne steht rechts, darum liegt die Schattenflanke links. Das gilt für alle Motive einheitlich.
