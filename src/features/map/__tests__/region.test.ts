import type { Place } from '@/lib/places';

import { GERMANY_REGION, regionForPlace, regionForPlaces } from '../region';

const place = (id: string, lat: number, lng: number): Place => ({
  id,
  name: id,
  region: 'Test',
  type: 'Test',
  description: '',
  elevation_m: 0,
  lat,
  lng,
  unlock_radius_m: 250,
  badge_motif: 'peak',
  badge_shape: 'shield',
  badge_tone: 'brass',
  region_id: null,
  active: true,
});

describe('regionForPlaces', () => {
  it('liefert Deutschland-Fallback ohne Orte', () => {
    expect(regionForPlaces([])).toEqual(GERMANY_REGION);
  });

  it('umschließt alle Orte mit Rand', () => {
    const r = regionForPlaces([place('a', 47.42, 10.99), place('b', 54.57, 13.66)]);
    expect(r.latitude).toBeCloseTo((47.42 + 54.57) / 2, 5);
    expect(r.longitude).toBeCloseTo((10.99 + 13.66) / 2, 5);
    // Spannweite * 1.4 Rand
    expect(r.latitudeDelta).toBeCloseTo((54.57 - 47.42) * 1.4, 5);
    expect(r.longitudeDelta).toBeCloseTo((13.66 - 10.99) * 1.4, 5);
  });

  it('bleibt bei dichten Stadt-Unterregionen auf Stadt-Niveau (AP-R3)', () => {
    // Ladenburg-ähnlich: Hotspots < 1 km auseinander → ~2-km-Ausschnitt, kein Landesblick
    const r = regionForPlaces([place('a', 49.4711, 8.6075), place('b', 49.4748, 8.6066)]);
    expect(r.latitudeDelta).toBeCloseTo(0.02, 5);
    expect(r.longitudeDelta).toBeCloseTo(0.02, 5);
  });
});

describe('regionForPlace', () => {
  it('zentriert den Ort', () => {
    const r = regionForPlace(place('a', 47.42, 10.99));
    expect(r.latitude).toBe(47.42);
    expect(r.longitude).toBe(10.99);
  });

  it('skaliert den Zoom mit dem Freischalt-Radius (A-R3-3)', () => {
    const city = regionForPlace({ ...place('a', 49.47, 8.6), unlock_radius_m: 150 });
    const summit = regionForPlace({ ...place('b', 47.42, 10.99), unlock_radius_m: 500 });
    expect(city.latitudeDelta).toBeCloseTo((150 * 14) / 111320, 5);
    expect(summit.latitudeDelta).toBeCloseTo((500 * 14) / 111320, 5);
    expect(city.latitudeDelta).toBeLessThan(summit.latitudeDelta);
    // Klemmen: nie weiter heraus als 0,08°
    const huge = regionForPlace({ ...place('c', 47, 10), unlock_radius_m: 1000 });
    expect(huge.latitudeDelta).toBe(0.08);
  });

  it('verbreitert den Längengrad-Ausschnitt mit cos(lat)', () => {
    const r = regionForPlace(place('a', 54.57, 13.66));
    expect(r.longitudeDelta).toBeCloseTo(r.latitudeDelta / Math.cos((54.57 * Math.PI) / 180), 6);
  });
});
