import { fieldHalfWidth } from '../geometry';
import {
  crownsAlong,
  fir,
  hatch,
  mirror,
  mountain,
  poly,
  skyHatch,
  snowCap,
  sunRays,
  trail,
  treeline,
  xAt,
} from '../sceneryKit';

/** Alle Koordinaten eines Pfads (für Bereichsprüfungen). */
function coords(d: string): [number, number][] {
  return [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
}

describe('sceneryKit', () => {
  const m = mountain([110, 104], 22, 198, 216);

  it('Berg läuft vom linken Fuß über den Gipfel zum rechten Fuß', () => {
    expect(m.outline[0]).toEqual([22, 216]);
    expect(m.outline[m.outline.length - 1]).toEqual([198, 216]);
    expect(Math.min(...m.outline.map((p) => p[1]))).toBe(104);
  });

  it('Schneefeld bleibt im oberen Teil des Berges', () => {
    const ys = coords(snowCap(m, 27)).map((p) => p[1]);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(104);
    expect(Math.max(...ys)).toBeLessThan(104 + 27 * 1.4);
  });

  it('Schraffur liegt innerhalb des Polygons', () => {
    const square: [number, number][] = [
      [0, 0],
      [40, 0],
      [40, 40],
      [0, 40],
    ];
    const pts = coords(hatch(square, -45, 3));
    expect(pts.length).toBeGreaterThan(10);
    pts.forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(-0.1);
      expect(x).toBeLessThanOrEqual(40.1);
      expect(y).toBeGreaterThanOrEqual(-0.1);
      expect(y).toBeLessThanOrEqual(40.1);
    });
  });

  it('Pfad endet knapp unter dem Gipfel', () => {
    const pts = coords(trail(m));
    const end = pts[pts.length - 1];
    expect(end[1]).toBeGreaterThan(104);
    expect(end[1]).toBeLessThan(115);
  });

  it('xAt findet Kreuzungen, poly schließt', () => {
    expect(
      xAt(
        [
          [0, 0],
          [10, 10],
        ],
        5,
      ),
    ).toBe(5);
    expect(
      poly([
        [0, 0],
        [1, 1],
      ]),
    ).toBe('M0,0 L1,1 Z');
  });

  it('Formbreite: Schild oben voll, Oval oben schmal', () => {
    expect(fieldHalfWidth('shield', 60)).toBe(80);
    expect(fieldHalfWidth('oval', 134)).toBeCloseTo(80, 0);
    expect(fieldHalfWidth('oval', 40)).toBeLessThan(40);
  });

  it('Strahlen liegen im Ring um die Sonne', () => {
    coords(sunRays(100, 100, 12, 18)).forEach(([x, y]) => {
      const r = Math.hypot(x - 100, y - 100);
      expect(r).toBeGreaterThan(11.9);
      expect(r).toBeLessThan(18.1);
    });
  });

  it('Himmelsschraffur spart die Sonne aus', () => {
    const d = skyHatch(100, 120, 4, { cx: 110, cy: 108, r: 8 });
    // Die Linie auf Sonnenhöhe ist geteilt: endet links vor und beginnt rechts nach der Sonne
    expect(d).toContain('M-12,108 H102');
    expect(d).toContain('M118,108 H232');
  });

  it('Tanne, Waldkante und Kronen bleiben in ihrem Rahmen', () => {
    coords(fir(50, 200, 30)).forEach(([x, y]) => {
      expect(Math.abs(x - 50)).toBeLessThanOrEqual(30 * 0.38 + 0.1);
      expect(y).toBeGreaterThanOrEqual(170 - 0.1);
      expect(y).toBeLessThanOrEqual(200.1);
    });
    coords(treeline(0, 60, 150, 6, 8, 200)).forEach(([x, y]) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(66);
      expect(y).toBeGreaterThanOrEqual(150 - 8 * 1.15 - 0.1);
    });
    const crowns = crownsAlong(
      [
        [0, 100],
        [40, 96],
      ],
      4,
      5,
    );
    expect(crowns.startsWith('M0,100')).toBe(true);
    expect(crowns.endsWith('Z')).toBe(true);
  });

  it('Spiegelung liegt unter der Wasserlinie', () => {
    mirror(m.outline, 216).forEach(([, y]) => expect(y).toBeGreaterThanOrEqual(216));
  });
});
