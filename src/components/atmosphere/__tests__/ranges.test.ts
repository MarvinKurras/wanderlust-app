import { approxPathLength, RANGES, restOffset } from '../ranges';

describe('approxPathLength', () => {
  it('misst gerade Strecken exakt', () => {
    expect(approxPathLength('M0,0 L3,4')).toBeCloseTo(5);
    expect(approxPathLength('M0,0 L3,4 L3,10')).toBeCloseTo(11);
  });

  it('nähert eine Bézierkurve zwischen Sehne und Kontrollpolygon an', () => {
    const len = approxPathLength('M0,0 Q50,100 100,0');
    expect(len).toBeGreaterThan(100); // länger als die Sehne
    expect(len).toBeLessThan(2 * Math.hypot(50, 100)); // kürzer als das Kontrollpolygon
  });

  it('liefert für jede Website-Kette eine plausible Länge (≥ Bühnenbreite)', () => {
    RANGES.forEach((layer) => {
      expect(approxPathLength(layer.ridge)).toBeGreaterThanOrEqual(1600);
    });
  });
});

describe('restOffset', () => {
  it('folgt der Website-Formel: vordere Ketten liegen tiefer', () => {
    expect(restOffset(0)).toBeCloseTo((72 + 16) * 0.32);
    const offsets = RANGES.map((_, i) => restOffset(i));
    for (let i = 1; i < offsets.length; i += 1) {
      expect(offsets[i]).toBeGreaterThan(offsets[i - 1]);
    }
  });
});
