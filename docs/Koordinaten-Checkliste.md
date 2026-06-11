# Koordinaten-Checkliste (Freischaltpunkte)

Die Website-Koordinaten sind **nicht final** (nur Minuten-Präzision). Unten die in `supabase/migrations/20260610120100_seed_places.sql` hinterlegten Freischaltpunkte. Vor Release muss jeder Punkt manuell geprüft werden (Karte/amtliche Daten, idealerweise vor Ort): Liegt der Punkt dort, wo Wanderer realistisch stehen? Passt der Radius zum Gelände?

| Ort | Freischaltpunkt (Annahme) | lat | lng | Radius | Verifiziert |
|---|---|---|---|---|---|
| Zugspitze | Gipfelplattform | 47.4211 | 10.9863 | 250 m | ☐ |
| Watzmann | Mittelspitze | 47.5550 | 12.9183 | 300 m | ☐ |
| Königssee | Steg St. Bartholomä | 47.5479 | 12.9776 | 400 m | ☐ |
| Brocken | Gipfelkuppe | 51.7991 | 10.6156 | 300 m | ☐ |
| Feldberg | Gipfel (Höchsten) | 47.8740 | 8.0046 | 300 m | ☐ |
| Königsstuhl | Aussichtsplattform | 54.5717 | 13.6628 | 200 m | ☐ |
| Gr. Arber | Gipfelkreuz | 49.1125 | 13.1347 | 300 m | ☐ |
| Wendelstein | Gipfel/Bergstation | 47.7036 | 12.0139 | 250 m | ☐ |

Änderungen an Koordinaten/Radien erfolgen per neuer Migration (Update auf `public.places`), nicht durch Editieren bestehender Migrationen.

## Unterregion Ladenburg (AP-R, Stadt-Radien 150–200 m — A-R-1)

| Hotspot | Freischaltpunkt (Annahme) | lat | lng | Radius | Verifiziert |
|---|---|---|---|---|---|
| Marktplatz | Marienbrunnen | 49.4711 | 8.6075 | 150 m | ☐ |
| Lobdengau-Museum | Bischofshof/Amtshofplatz | 49.4719 | 8.6057 | 150 m | ☐ |
| Automuseum Dr. Carl Benz | Ilvesheimer Straße | 49.4665 | 8.6094 | 200 m | ☐ |
| Carl-Benz-Haus & Benzpark | Benzpark | 49.4730 | 8.6128 | 200 m | ☐ |
| Neckarwiese | Festwiese am Neckarufer | 49.4748 | 8.6066 | 200 m | ☐ |
| Martinstor | Stadttor | 49.4694 | 8.6062 | 150 m | ☐ |
| Galluskirche | Kirchenvorplatz | 49.4706 | 8.6051 | 150 m | ☐ |
