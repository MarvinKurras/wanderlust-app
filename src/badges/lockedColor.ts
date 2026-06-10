/**
 * Approximation des Website-Locked-Zustands (CSS `grayscale(.85) brightness(.62)`)
 * als Farbtransformation, da `react-native-svg` keine CSS-Filter kennt
 * (Annahme A-AP2-2 in docs/AP2-Plan.md). Die Gesamt-Opacity (.62) setzt
 * die Komponente auf der Wurzel.
 */
const GRAYSCALE = 0.85;
const BRIGHTNESS = 0.62;

export function lockedColor(hex: string): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) {
    return hex;
  }
  const n = parseInt(m[1], 16);
  let r = (n >> 16) & 0xff;
  let g = (n >> 8) & 0xff;
  let b = n & 0xff;

  // CSS-Filter grayscale: Luminanz-Gewichte (Rec. 709)
  const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  r = (r * (1 - GRAYSCALE) + gray * GRAYSCALE) * BRIGHTNESS;
  g = (g * (1 - GRAYSCALE) + gray * GRAYSCALE) * BRIGHTNESS;
  b = (b * (1 - GRAYSCALE) + gray * GRAYSCALE) * BRIGHTNESS;

  const to = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Identität für den normalen (freigeschalteten) Zustand. */
export const identityColor = (hex: string): string => hex;
