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
    // Spannweite * 1.25 Rand
    expect(r.latitudeDelta).toBeCloseTo((54.57 - 47.42) * 1.25, 5);
    expect(r.longitudeDelta).toBeCloseTo((13.66 - 10.99) * 1.25, 5);
  });

  it('hat eine Mindestgröße bei einem einzelnen Ort', () => {
    const r = regionForPlaces([place('a', 47.42, 10.99)]);
    expect(r.latitudeDelta).toBeGreaterThanOrEqual(0.5);
    expect(r.longitudeDelta).toBeGreaterThanOrEqual(0.5);
  });
});

describe('regionForPlace', () => {
  it('zentriert den Ort', () => {
    const r = regionForPlace(place('a', 47.42, 10.99));
    expect(r.latitude).toBe(47.42);
    expect(r.longitude).toBe(10.99);
  });
});
