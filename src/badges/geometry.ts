import type { BadgeShape } from '@/lib/places';

/**
 * Geometrie der Stockschilder — 1:1 aus `wanderlust/badges.js` portiert.
 * viewBox 0 0 220 252; Werte nicht verändern (Pixel-Treue zur Website).
 */
export const VIEWBOX = { width: 220, height: 252 } as const;
export const CENTER = { x: 110, y: 134 } as const;
/** Eingelassenes Emaille-Feld: Schildform um CENTER auf 0,88 skaliert (badges.js). */
export const FIELD_SCALE = 0.88;

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

type Pt = readonly [number, number];

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, steps = 48): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

function quad(p0: Pt, p1: Pt, p2: Pt, steps = 24): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  return out;
}

/** Rechte Hälfte jedes Umrisses von oben nach unten (x ≥ CENTER.x) als Polylinie. */
const RIGHT_OUTLINE: Record<BadgeShape, Pt[]> = {
  shield: [
    [110, 28],
    [190, 28],
    [190, 122],
    ...cubic([190, 122], [190, 182], [152, 218], [110, 240]),
  ],
  arch: [
    [110, 30],
    [174, 30],
    ...quad([174, 30], [186, 30], [186, 46]),
    [186, 202],
    ...cubic([186, 202], [186, 226], [162, 240], [110, 240]),
  ],
  oval: Array.from({ length: 97 }, (_, i): Pt => {
    const a = -Math.PI / 2 + (Math.PI * i) / 96;
    return [CENTER.x + 80 * Math.cos(a), CENTER.y + 108 * Math.sin(a)];
  }),
};

/**
 * Halbe Breite der Schildform auf Höhe `y` (viewBox-Einheiten, unskaliert) —
 * für Namenssatz und Ornamente, damit nichts über den Rand läuft.
 */
export function fieldHalfWidth(shape: BadgeShape, y: number): number {
  const pts = RIGHT_OUTLINE[shape];
  if (y <= pts[0][1] || y >= pts[pts.length - 1][1]) return 0;
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (y >= Math.min(y0, y1) && y <= Math.max(y0, y1)) {
      const x = y1 === y0 ? Math.max(x0, x1) : x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
      return x - CENTER.x;
    }
  }
  return 0;
}
