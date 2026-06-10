/**
 * Geo-Helfer für die Anzeige. Die Freischalt-Entscheidung fällt ausschließlich
 * serverseitig (Edge Function `unlock`) — diese Formeln dienen Distanzanzeige
 * und Tests und müssen mit der Edge Function übereinstimmen (Projektplan §9).
 */

/** Haversine-Distanz in Metern (WGS84, mittlerer Erdradius). */
export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Unlock-Regel (nur Anzeige/Tests): `distance <= radius + min(accuracy, 50)`, nie bei accuracy > 100. */
export function wouldUnlock(distanceM: number, radiusM: number, accuracyM: number): boolean {
  if (accuracyM > 100) {
    return false;
  }
  return distanceM <= radiusM + Math.min(accuracyM, 50);
}

/** Distanz deutsch formatiert: „830 m" bzw. „3,2 km". */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  return `${String(rounded).replace('.', ',')} km`;
}
