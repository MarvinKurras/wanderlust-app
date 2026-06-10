import { formatCoords, formatDateDe } from '../format';

describe('formatCoords', () => {
  it('formatiert wie die Website (Grad/Minuten, N/O)', () => {
    expect(formatCoords(47.4211, 10.9863)).toBe('47°25′N 10°59′O');
    expect(formatCoords(54.5717, 13.6628)).toBe('54°34′N 13°40′O');
  });

  it('behandelt Süd/West und Minuten-Überlauf', () => {
    expect(formatCoords(-33.8688, -151.9995)).toBe('33°52′S 152°00′W');
  });
});

describe('formatDateDe', () => {
  it('formatiert deutsch wie die Website-Daten', () => {
    expect(formatDateDe('2024-07-19T10:30:00Z')).toBe('19. Juli 2024');
    expect(formatDateDe('2025-05-14T00:00:00Z')).toBe('14. Mai 2025');
  });
});
