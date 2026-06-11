import type { Place } from '@/lib/places';
import type { Region } from '@/lib/regions';

import { buildPlaceSections, FALLBACK_SECTION_KEY } from '../sections';

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

const REGIONS = [
  region('bw', 'Baden-Württemberg'),
  region('ladenburg', 'Ladenburg', 'bw'),
  region('heidelberg', 'Heidelberg', 'bw'),
];

describe('buildPlaceSections', () => {
  it('gruppiert nach Region (alphabetisch) mit Fallback am Ende', () => {
    const sections = buildPlaceSections(
      [place('l1', 'ladenburg'), place('alt', null), place('h1', 'heidelberg')],
      REGIONS,
      'Weitere Ziele',
    );
    expect(sections.map((s) => s.key)).toEqual(['heidelberg', 'ladenburg', FALLBACK_SECTION_KEY]);
    expect(sections[1].title).toBe('Ladenburg');
    expect(sections[2].data.map((p) => p.id)).toEqual(['alt']);
    expect(sections[2].regionId).toBeNull();
  });

  it('lässt leere Sektionen weg', () => {
    const sections = buildPlaceSections([place('l1', 'ladenburg')], REGIONS, 'Weitere Ziele');
    expect(sections.map((s) => s.key)).toEqual(['ladenburg']);
  });

  it('behandelt unbekannte region_id wie ohne Zuordnung', () => {
    const sections = buildPlaceSections([place('x', 'gibt-es-nicht')], REGIONS, 'Weitere Ziele');
    expect(sections.map((s) => s.key)).toEqual([FALLBACK_SECTION_KEY]);
  });
});
