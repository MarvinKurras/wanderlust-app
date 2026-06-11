-- AP-R: Erste Region/Unterregion + 7 Ladenburg-Hotspots. Idempotent via upsert.
-- Koordinaten: Näherungen (A-R-2) — vor Release verifizieren (docs/Koordinaten-Checkliste.md).
-- Stadt-Radien 150–200 m (A-R-1, Ziele liegen dicht beieinander).

insert into public.regions (id, name, parent_id) values
  ('baden-wuerttemberg', 'Baden-Württemberg', null),
  ('ladenburg', 'Ladenburg', 'baden-wuerttemberg')
on conflict (id) do update set
  name = excluded.name,
  parent_id = excluded.parent_id;

insert into public.places
  (id, name, region, type, description, elevation_m, lat, lng, unlock_radius_m, badge_motif, badge_shape, badge_tone, region_id)
values
  ('ladenburg-marktplatz', 'Marktplatz', 'Ladenburg · Kurpfalz', 'Herz der Altstadt',
   'Fachwerk drängt sich um den Marienbrunnen — seit Römertagen wird hier gehandelt, gefeiert und erzählt. Wer auf dem Marktplatz steht, steht mitten in zwei Jahrtausenden.',
   98, 49.4711, 8.6075, 150, 'tower', 'arch', 'brass', 'ladenburg'),

  ('ladenburg-lobdengau-museum', 'Lobdengau-Museum', 'Ladenburg · Kurpfalz', 'Museum im Bischofshof',
   'Im alten Bischofshof erzählt das Lobdengau-Museum von Lopodunum — dem römischen Ladenburg. Steinerne Götter, Scherben und Inschriften, Schicht um Schicht Geschichte.',
   99, 49.4719, 8.6057, 150, 'tower', 'oval', 'pewter', 'ladenburg'),

  ('ladenburg-automuseum', 'Automuseum Dr. Carl Benz', 'Ladenburg · Kurpfalz', 'Museum in der alten Benz-Fabrik',
   'In der ehemaligen Fabrikhalle von Carl Benz glänzen die Pioniere des Automobils. Hier, wo der Erfinder zuletzt baute, riecht es noch nach Aufbruch und Benzin.',
   97, 49.4665, 8.6094, 200, 'tower', 'shield', 'copper', 'ladenburg'),

  ('ladenburg-benzpark', 'Carl-Benz-Haus & Benzpark', 'Ladenburg · Kurpfalz', 'Wohnhaus des Erfinders am Park',
   'Die Villa des Automobilpioniers mit ihrem Park am Neckar — Alterssitz von Carl und Bertha Benz. Unter alten Bäumen lässt sich erahnen, wohin die erste Ausfahrt führte.',
   96, 49.4730, 8.6128, 200, 'forest', 'arch', 'copper', 'ladenburg'),

  ('ladenburg-neckarwiese', 'Neckarwiese', 'Ladenburg · Kurpfalz', 'Flussufer vor der Altstadtkulisse',
   'Weite Wiesen am Neckarufer, dahinter die Türme der Altstadt. Hier wird gepicknickt, gestaunt und in den Sonnenuntergang geschaut — Ladenburgs grünes Wohnzimmer.',
   95, 49.4748, 8.6066, 200, 'lake', 'arch', 'silver', 'ladenburg'),

  ('ladenburg-martinstor', 'Martinstor', 'Ladenburg · Kurpfalz', 'Stadttor der mittelalterlichen Mauer',
   'Das letzte erhaltene Stadttor Ladenburgs, eingebettet in den Rest der alten Mauer. Wer hindurchgeht, betritt die Stadt wie die Reisenden vor sechshundert Jahren.',
   98, 49.4694, 8.6062, 150, 'tower', 'shield', 'pewter', 'ladenburg'),

  ('ladenburg-galluskirche', 'Galluskirche', 'Ladenburg · Kurpfalz', 'Gotische Kirche über römischen Mauern',
   'Die evangelische Galluskirche steht auf den Fundamenten einer römischen Basilika — Glaube über Forum. Ihr Turm gehört zur Silhouette Ladenburgs wie der Neckar zur Stadt.',
   100, 49.4706, 8.6051, 150, 'tower', 'oval', 'brass', 'ladenburg')

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
  badge_tone = excluded.badge_tone,
  region_id = excluded.region_id;
