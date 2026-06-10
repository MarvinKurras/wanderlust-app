-- AP3: Seed der 8 MVP-Orte als Migration (statt seed.sql), damit die Inhalte
-- auch beim Remote-Deploy ankommen. Idempotent via upsert.
-- Inhalte: Website-Repo wanderlust/map/data.js · Koordinaten: Projektplan §7
-- (Dezimalgrad, Freischaltpunkte — vor Release verifizieren, siehe docs/Koordinaten-Checkliste.md).

insert into public.places
  (id, name, region, type, description, elevation_m, lat, lng, unlock_radius_m, badge_motif, badge_shape, badge_tone)
values
  ('zugspitze', 'Zugspitze', 'Wettersteingebirge', 'Höchster Gipfel Deutschlands',
   'Der höchste Berg Deutschlands an der Grenze zu Österreich, gekrönt vom goldenen Gipfelkreuz. Bei klarer Sicht reicht der Blick über vier Länder und unzählige Alpengipfel.',
   2962, 47.4211, 10.9863, 250, 'peak', 'shield', 'brass'),

  ('watzmann', 'Watzmann', 'Berchtesgadener Alpen', 'Dritthöchster Berg Deutschlands',
   'Der sagenumwobene König Watzmann mit seiner berüchtigten Ostwand — der höchsten Felswand der Ostalpen. Sein markantes Doppelgipfel-Profil thront über dem Königssee.',
   2713, 47.5550, 12.9183, 300, 'twin', 'shield', 'brass'),

  ('koenigssee', 'Königssee', 'Berchtesgaden', 'Smaragdgrüner Bergsee',
   'Ein fjordartiger Alpensee von smaragdgrüner Klarheit, eingerahmt von steilen Wänden. Über dem Wasser leuchten die roten Zwiebeltürme der Wallfahrtskirche St. Bartholomä.',
   603, 47.5479, 12.9776, 400, 'lake', 'arch', 'brass'),

  ('brocken', 'Brocken', 'Harz', 'Höchster Berg Norddeutschlands',
   'Der neblige Gipfel der Harzer Hexensagen und der Walpurgisnacht. Eine Schmalspurbahn dampft hinauf, oben drehen sich Wetterstation und Antennen im rauen Wind.',
   1141, 51.7991, 10.6156, 300, 'tower', 'oval', 'pewter'),

  ('feldberg', 'Feldberg', 'Schwarzwald', 'Höchster Schwarzwaldgipfel',
   'Die höchste Erhebung des Schwarzwalds — weite, baumfreie Kuppen über dunklen Tannenwäldern. Im Winter das südlichste große Skigebiet Deutschlands.',
   1493, 47.8740, 8.0046, 300, 'forest', 'oval', 'copper'),

  ('koenigsstuhl', 'Königsstuhl', 'Rügen · Jasmund', 'Kreidekliff am Meer',
   'Die berühmteste Kreidefelsformation der Insel Rügen, hoch über der Ostsee im Nationalpark Jasmund. Schon die Romantiker um Caspar David Friedrich pilgerten zu diesem leuchtend weißen Aussichtspunkt.',
   118, 54.5717, 13.6628, 200, 'cliff', 'arch', 'silver'),

  ('arber', 'Gr. Arber', 'Bayerischer Wald', 'König des Bayerwaldes',
   'Der „König des Bayerischen Waldes" mit seinen weißen Radarkuppeln und windzerzausten Latschen. Zu seinen Füßen liegen die stillen Arberseen in alten Karen.',
   1456, 49.1125, 13.1347, 300, 'peak', 'shield', 'pewter'),

  ('wendelstein', 'Wendelstein', 'Mangfallgebirge', 'Aussichtsberg mit Sternwarte',
   'Ein freistehender Aussichtsberg über dem Voralpenland mit historischer Zahnradbahn, Sternwarte und der höchstgelegenen Kirche Deutschlands. Noch wartet sein Abzeichen auf dich.',
   1838, 47.7036, 12.0139, 250, 'tower', 'shield', 'copper')

on conflict (id) do update set
  name = excluded.name,
  region = excluded.region,
  type = excluded.type,
  description = excluded.description,
  elevation_m = excluded.elevation_m,
  lat = excluded.lat,
  lng = excluded.lng,
  unlock_radius_m = excluded.unlock_radius_m,
  badge_motif = excluded.badge_motif,
  badge_shape = excluded.badge_shape,
  badge_tone = excluded.badge_tone;
