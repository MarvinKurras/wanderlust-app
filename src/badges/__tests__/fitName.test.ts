import type { BadgeShape } from '@/lib/places';

import { fitBand, fitName, fitRegion, MONO_EM, nameWidth, nameWidthEm } from '../fitName';
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

  it('Regionszeile nie breiter als der Name; im Oval notfalls gekürzt', () => {
    const oval = fitName('Galluskirche', 'oval');
    const r = fitRegion('LADENBURG · KURPFALZ', 'oval', oval);
    expect(r.text).toBe('LADENBURG');
    const width = r.text.length * r.fontSize * MONO_EM + (r.text.length - 1) * r.letterSpacing;
    expect(width).toBeLessThanOrEqual(nameWidth(oval) * 1.05 + 0.1);

    const arch = fitName('Marktplatz', 'arch');
    expect(fitRegion('LADENBURG · KURPFALZ', 'arch', arch).text).toBe('LADENBURG · KURPFALZ');
  });

  it.each(SEEDS)('Höhe im unteren Band von %s (%s) hält Abstand zum Rand', (_name, shape) => {
    // „KOMPLETT" trägt nur das ovale Regions-Siegel
    for (const text of shape === 'oval' ? ['2962 m', '118 m', 'KOMPLETT'] : ['2962 m', '118 m']) {
      const b = fitBand(text, shape);
      const top = b.baseline - b.fontSize * 0.7;
      const half = Math.min(fieldHalfWidth(shape, top), fieldHalfWidth(shape, b.baseline));
      expect(half - b.halfWidth).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(['shield', 'arch', 'oval'] as const)(
    'Extremfall: langes Einzelwort im %s bleibt im Feld',
    (shape) => {
      const l = fitName('Neuschwanstein', shape);
      const half = fieldHalfWidth(shape, l.baselines[0] - l.fontSize * 0.65);
      expect((nameWidthEm(l.lines[0]) * l.fontSize) / 2).toBeLessThanOrEqual(half);
    },
  );
});
