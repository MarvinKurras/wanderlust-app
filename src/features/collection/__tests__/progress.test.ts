import { progressLabel, progressSub } from '../progress';

describe('progressLabel', () => {
  it('formatiert n / total', () => {
    expect(progressLabel(3, 8)).toBe('3 / 8 erwandert');
  });
});

describe('progressSub (Wording aus karte.html)', () => {
  it('komplett', () => {
    expect(progressSub(8, 8)).toBe('Alle Gipfel erwandert — Sammlung komplett');
  });
  it('leer', () => {
    expect(progressSub(0, 8)).toBe('Noch kein Gipfel erwandert — leg los');
  });
  it('Singular', () => {
    expect(progressSub(7, 8)).toBe('1 Gipfel liegt noch im Nebel');
  });
  it('Plural', () => {
    expect(progressSub(3, 8)).toBe('5 Gipfel liegen noch im Nebel');
  });
});
