import type { BadgeShape } from '@/lib/places';

import { fitName, fitRegion, nameWidthEm } from '../fitName';
import { fieldHalfWidth } from '../geometry';

/** Alle 15 Seed-Orte (supabase/migrations …_seed_places.sql, …_ladenburg). */
const SEEDS: [string, BadgeShape][] = [
  ['Zugspitze', 'shield'],
  ['Watzmann', 'shield'],
  ['Königssee', 'arch'],
  ['Brocken', 'oval'],
  ['Feldberg', 'oval'],
  ['Königsstuhl', 'arch'],
  ['Gr. Arber', 'shield'],
  ['Wendelstein', 'shield'],
  ['Marktplatz', 'arch'],
  ['Lobdengau-Museum', 'oval'],
  ['Automuseum Dr. Carl Benz', 'shield'],
  ['Carl-Benz-Haus & Benzpark', 'arch'],
  ['Neckarwiese', 'arch'],
  ['Martinstor', 'shield'],
  ['Galluskirche', 'oval'],
];

describe('fitName', () => {
  it('kurze Namen einzeilig mit Trennraute, höchstens 19,5', () => {
    const l = fitName('Zugspitze', 'shield');
    expect(l.lines).toEqual(['ZUGSPITZE']);
    expect(l.fontSize).toBeLessThanOrEqual(19.5);
    expect(l.dividerY).not.toBeNull();
  });

  it('lange Namen brechen an Leerzeichen bzw. nach Bindestrich um', () => {
    expect(fitName('Automuseum Dr. Carl Benz', 'shield').lines).toEqual([
      'AUTOMUSEUM',
      'DR. CARL BENZ',
    ]);
    expect(fitName('Lobdengau-Museum', 'oval').lines).toEqual(['LOBDENGAU-', 'MUSEUM']);
    expect(fitName('Carl-Benz-Haus & Benzpark', 'arch').lines).toHaveLength(2);
  });

  it.each(SEEDS)('%s passt in die Form (%s)', (name, shape) => {
    const l = fitName(name, shape);
    l.lines.forEach((text, i) => {
      const width = nameWidthEm(text) * l.fontSize;
      const y = l.baselines[i];
      const half = Math.min(fieldHalfWidth(shape, y - l.fontSize * 0.65), fieldHalfWidth(shape, y));
      expect(width / 2).toBeLessThanOrEqual(half);
    });
  });

  it('die Regionszeile schrumpft in schmalen Formen', () => {
    const wide = fitRegion('LADENBURG · KURPFALZ', 'shield', 75);
    const narrow = fitRegion('LADENBURG · KURPFALZ', 'oval', 79);
    expect(narrow.fontSize).toBeLessThan(wide.fontSize);
  });
});
