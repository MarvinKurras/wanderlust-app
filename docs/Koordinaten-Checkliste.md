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
