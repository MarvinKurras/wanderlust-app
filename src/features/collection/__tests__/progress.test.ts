import { progressSub } from '../progress';

describe('progressSub (Aufbau aus karte.html, „Ziele" statt „Gipfel")', () => {
  it('komplett', () => {
    expect(progressSub(8, 8)).toBe('Alle Ziele erwandert — Sammlung komplett');
  });
  it('leer', () => {
    expect(progressSub(0, 8)).toBe('Noch kein Ziel erwandert — leg los');
  });
  it('Singular', () => {
    expect(progressSub(7, 8)).toBe('1 Ziel liegt noch im Nebel');
  });
  it('Plural', () => {
    expect(progressSub(3, 8)).toBe('5 Ziele liegen noch im Nebel');
  });
});
