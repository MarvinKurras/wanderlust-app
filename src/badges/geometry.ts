import type { BadgeShape } from '@/lib/places';

/**
 * Geometrie der Stockschilder — 1:1 aus `wanderlust/badges.js` portiert.
 * viewBox 0 0 220 252; Werte nicht verändern (Pixel-Treue zur Website).
 */
export const VIEWBOX = { width: 220, height: 252 } as const;
export const CENTER = { x: 110, y: 134 } as const;

export const SHAPES: Record<BadgeShape, string> = {
  shield: 'M30,28 L190,28 L190,122 C190,182 152,218 110,240 C68,218 30,182 30,122 Z',
  arch: 'M46,30 H174 Q186,30 186,46 V202 C186,226 162,240 110,240 C58,240 34,226 34,202 V46 Q34,30 46,30 Z',
  oval: 'M30,134 a80,108 0 1,0 160,0 a80,108 0 1,0 -160,0 Z',
};

/** Nietenkopf-Positionen pro Form. */
export const NAILS: Record<BadgeShape, readonly (readonly [number, number])[]> = {
  shield: [
    [48, 44],
    [172, 44],
    [64, 196],
    [156, 196],
  ],
  arch: [
    [52, 50],
    [168, 50],
    [58, 216],
    [162, 216],
  ],
  oval: [
    [110, 38],
    [180, 134],
    [110, 230],
    [40, 134],
  ],
};
