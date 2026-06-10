/** Anzeige-Formatierungen (deutsch, deterministisch auf allen Plattformen — A-AP4-3/4). */

const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

/** ISO-Timestamp → „19. Juli 2024" */
export function formatDateDe(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Dezimalgrad → Website-Format „47°25′N 10°59′O" */
export function formatCoords(lat: number, lng: number): string {
  const part = (value: number, pos: string, neg: string) => {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const min = Math.round((abs - deg) * 60);
    // 60-Minuten-Überlauf durch Rundung abfangen
    const [d, m] = min === 60 ? [deg + 1, 0] : [deg, min];
    return `${d}°${String(m).padStart(2, '0')}′${value >= 0 ? pos : neg}`;
  };
  return `${part(lat, 'N', 'S')} ${part(lng, 'O', 'W')}`;
}
