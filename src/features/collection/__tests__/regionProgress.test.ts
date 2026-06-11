import type { Place } from '@/lib/places';
import type { Region } from '@/lib/regions';

import { regionProgress, regionProgressLabel } from '../regionProgress';

const region = (id: string, name: string, parent_id: string | null = null): Region => ({
  id,
  name,
  parent_id,
  active: true,
});

const place = (id: string, region_id: string | null): Place => ({
  id,
  name: id,
  region: 'Test',
  type: 'Test',
  description: '',
  elevation_m: 100,
  lat: 49.47,
  lng: 8.6,
  unlock_radius_m: 150,
  badge_motif: 'tower',
  badge_shape: 'arch',
  badge_tone: 'brass',
  region_id,
  active: true,
});

const REGIONS = [region('bw', 'Baden-Württemberg'), region('ladenburg', 'Ladenburg', 'bw')];
const PLACES = [
  place('a', 'ladenburg'),
  place('b', 'ladenburg'),
  place('c', 'ladenburg'),
  place('alt-ort', null), // Alt-Ort ohne Zuordnung zählt nirgends
];
const unlock = (placeId: string) => ({ place_id: placeId, unlocked_at: '2026-06-11T10:00:00Z' });

describe('regionProgress', () => {
  it('zählt Unterregion und rollt zur Elternregion hoch', () => {
    const p = regionProgress(REGIONS, PLACES, [unlock('a'), unlock('b')]);
    expect(p.get('ladenburg')).toMatchObject({ total: 3, unlocked: 2, complete: false });
    expect(p.get('bw')).toMatchObject({ total: 3, unlocked: 2, complete: false });
  });

  it('markiert complete, wenn alle Ziele erledigt sind', () => {
    const p = regionProgress(REGIONS, PLACES, [unlock('a'), unlock('b'), unlock('c')]);
    expect(p.get('ladenburg')?.complete).toBe(true);
    expect(p.get('bw')?.complete).toBe(true);
  });

  it('ist nie complete ohne Ziele', () => {
    const p = regionProgress([region('leer', 'Leer')], PLACES, []);
    expect(p.get('leer')).toMatchObject({ total: 0, unlocked: 0, complete: false });
  });

  it('zählt bei Eltern mit eigenen Zielen und mehreren Unterregionen nicht doppelt', () => {
    const regions = [
      region('bw', 'Baden-Württemberg'),
      region('ladenburg', 'Ladenburg', 'bw'),
      region('heidelberg', 'Heidelberg', 'bw'),
    ];
    const places = [
      place('a', 'ladenburg'),
      place('b', 'heidelberg'),
      place('c', 'bw'), // direktes Ziel der Elternregion
    ];
    const p = regionProgress(regions, places, [unlock('a'), unlock('c')]);
    expect(p.get('ladenburg')).toMatchObject({ total: 1, unlocked: 1, complete: true });
    expect(p.get('heidelberg')).toMatchObject({ total: 1, unlocked: 0, complete: false });
    expect(p.get('bw')).toMatchObject({ total: 3, unlocked: 2, complete: false });
  });

  it('ignoriert Orte mit unbekannter region_id', () => {
    const p = regionProgress(REGIONS, [place('x', 'gibt-es-nicht')], []);
    expect(p.get('ladenburg')?.total).toBe(0);
  });
});

describe('regionProgressLabel', () => {
  it('formatiert wie gefordert', () => {
    const p = regionProgress(REGIONS, PLACES, [unlock('a'), unlock('b')]);
    expect(regionProgressLabel(p.get('ladenburg')!)).toBe('2 von 3 Zielen in Ladenburg erledigt');
  });

  it('Singular bei einem Ziel', () => {
    const p = regionProgress(REGIONS, [place('a', 'ladenburg')], []);
    expect(regionProgressLabel(p.get('ladenburg')!)).toBe('0 von 1 Ziel in Ladenburg erledigt');
  });
});
