import { de } from '@/i18n/de';

/** Fortschrittszeile der Sammlung — Aufbau aus `wanderlust/map/app.js` (`updateProgress`). */
export function progressSub(unlocked: number, total: number): string {
  const locked = total - unlocked;
  if (locked === 0) {
    return de.sammlung.restKomplett;
  }
  if (unlocked === 0) {
    return de.sammlung.restLeer;
  }
  return locked === 1 ? de.sammlung.restEins : de.sammlung.restViele(locked);
}
