import type { Place } from '@/lib/places';
import type { Region } from '@/lib/regions';

import {
  ALL_FILTER_KEY,
  buildRegionFilters,
  placesForFilter,
  regionWithDescendants,
  UNASSIGNED_FILTER_KEY,
} from '../regionFilter';

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
const PLACES = [place('l1', 'ladenburg'), place('l2', 'ladenburg'), place('alt', null)];

describe('regionWithDescendants', () => {
  it('liefert die Region samt aller Unterregionen', () => {
    expect(regionWithDescendants('bw', REGIONS)).toEqual(new Set(['bw', 'ladenburg']));
    expect(regionWithDescendants('ladenburg', REGIONS)).toEqual(new Set(['ladenburg']));
  });

  it('ist zyklensicher', () => {
    const cyclic = [region('a', 'A', 'b'), region('b', 'B', 'a')];
    expect(regionWithDescendants('a', cyclic)).toEqual(new Set(['a', 'b']));
  });
});

describe('placesForFilter', () => {
  it('rollt Elternregionen über Unterregionen auf', () => {
    expect(placesForFilter('bw', PLACES, REGIONS).map((p) => p.id)).toEqual(['l1', 'l2']);
  });

  it('liefert für „alle" und „weitere" die erwarteten Orte', () => {
    expect(placesForFilter(ALL_FILTER_KEY, PLACES, REGIONS)).toHaveLength(3);
    expect(placesForFilter(UNASSIGNED_FILTER_KEY, PLACES, REGIONS).map((p) => p.id)).toEqual([
      'alt',
    ]);
  });

  it('behandelt unbekannte region_id wie ohne Zuordnung', () => {
    const orphan = [place('x', 'gibt-es-nicht')];
    expect(placesForFilter(UNASSIGNED_FILTER_KEY, orphan, REGIONS).map((p) => p.id)).toEqual(['x']);
  });
});

describe('buildRegionFilters', () => {
  it('ordnet: Alle → Eltern → Unterregion → Weitere, mit Roll-up-Zählern', () => {
    const options = buildRegionFilters(PLACES, REGIONS, 'Alle Ziele', 'Weitere Ziele');
    expect(options.map((o) => o.key)).toEqual([
      ALL_FILTER_KEY,
      'bw',
      'ladenburg',
      UNASSIGNED_FILTER_KEY,
    ]);
    expect(options.map((o) => o.placeCount)).toEqual([3, 2, 2, 1]);
    expect(options.find((o) => o.key === 'ladenburg')?.depth).toBe(1);
  });

  it('lässt Regionen ohne Ziele weg', () => {
    const options = buildRegionFilters(
      PLACES,
      [...REGIONS, region('bayern', 'Bayern')],
      'Alle Ziele',
      'Weitere Ziele',
    );
    expect(options.map((o) => o.key)).not.toContain('bayern');
  });

  it('lässt „Weitere Ziele" weg, wenn alle Orte zugeordnet sind', () => {
    const options = buildRegionFilters(
      PLACES.filter((p) => p.region_id),
      REGIONS,
      'Alle Ziele',
      'Weitere Ziele',
    );
    expect(options.map((o) => o.key)).toEqual([ALL_FILTER_KEY, 'bw', 'ladenburg']);
  });
});
