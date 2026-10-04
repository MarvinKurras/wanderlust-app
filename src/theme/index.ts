export { colors, badgeTones, type BadgeTone } from './colors';
export { fonts, textStyles } from './typography';
export { spacing, radius } from './spacing';
export { landscape } from './landscape';
export { glass, shadows } from './glass';
export { mapPaint, androidMapStyle } from './mapStyle';
export { badgeScene } from './badgeScene';

/** Hängt einer #rrggbb-Farbe einen Alphawert an (0–1) → rgba(). */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
}
