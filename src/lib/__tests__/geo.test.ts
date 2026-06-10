import { formatDistance, haversineM, wouldUnlock } from '../geo';

describe('haversineM', () => {
  it('misst bekannte Strecken korrekt', () => {
    // Zugspitze → Watzmann: ~146 km (grobe Referenz)
    const d = haversineM(47.4211, 10.9863, 47.555, 12.9183);
    expect(d).toBeGreaterThan(140_000);
    expect(d).toBeLessThan(152_000);
  });

  it('ist 0 am selben Punkt', () => {
    expect(haversineM(51.0, 10.0, 51.0, 10.0)).toBe(0);
  });

  it('misst kleine Distanzen plausibel (~111 m pro 0.001° Breite)', () => {
    const d = haversineM(47.0, 10.0, 47.001, 10.0);
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(115);
  });
});

describe('wouldUnlock (Regel aus §9)', () => {
  it('erlaubt innerhalb radius + min(accuracy, 50)', () => {
    expect(wouldUnlock(250, 250, 10)).toBe(true);
    expect(wouldUnlock(260, 250, 10)).toBe(true); // 250 + 10
    expect(wouldUnlock(299, 250, 80)).toBe(true); // 250 + 50 (Cap)
    expect(wouldUnlock(300, 250, 80)).toBe(true);
  });

  it('lehnt außerhalb ab', () => {
    expect(wouldUnlock(261, 250, 10)).toBe(false);
    expect(wouldUnlock(301, 250, 80)).toBe(false); // Cap bei 50
  });

  it('lehnt bei accuracy > 100 immer ab', () => {
    expect(wouldUnlock(1, 250, 101)).toBe(false);
  });
});

describe('formatDistance', () => {
  it('formatiert Meter und Kilometer deutsch', () => {
    expect(formatDistance(830)).toBe('830 m');
    expect(formatDistance(999.4)).toBe('999 m');
    expect(formatDistance(3210)).toBe('3,2 km');
    expect(formatDistance(12600)).toBe('13 km');
  });
});
