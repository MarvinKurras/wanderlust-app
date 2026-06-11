/** Fortschrittstexte der Sammlung — Wording aus `wanderlust/map/app.js` (`updateProgress`). */
export function progressLabel(unlocked: number, total: number): string {
  return `${unlocked} / ${total} erwandert`;
}

export function progressSub(unlocked: number, total: number): string {
  const locked = total - unlocked;
  if (locked === 0) {
    return 'Alle Gipfel erwandert — Sammlung komplett';
  }
  if (unlocked === 0) {
    return 'Noch kein Gipfel erwandert — leg los';
  }
  return locked === 1
    ? '1 Gipfel liegt noch im Nebel'
    : `${locked} Gipfel liegen noch im Nebel`;
}
