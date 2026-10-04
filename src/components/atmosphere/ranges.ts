/**
 * Die sechs Bergketten des Website-Hero — Pfade 1:1 aus `wanderlust/app.js`
 * (LAYERS, cap(), fir()), viewBox 1600×700. Hinten (hell, hoch, zackig) →
 * vorne (dunkel, flach, weich). `ridge` ist die offene Silhouette und zugleich
 * der Skizzenstrich; die Füllung schließt sie zum Boden hin.
 */
export type RangeLayer = {
  /** Höhe der Ebene in Prozent der Bühne (Website: vh) */
  h: number;
  ridge: string;
  caps?: [number, number, number][];
  details?: string[];
  firs?: [number, number, number][];
};

export const VIEW_W = 1600;
export const VIEW_H = 700;

export const RANGES: RangeLayer[] = [
  {
    h: 72,
    ridge:
      'M0,322 L96,268 L168,176 L208,232 L252,206 L318,128 L356,208 L398,184 L470,258 L560,186 L640,278 L716,142 L762,216 L808,196 L872,250 L948,164 L1022,272 L1102,236 L1168,132 L1218,214 L1262,196 L1330,262 L1408,206 L1472,266 L1536,228 L1600,268',
    caps: [
      [318, 128, 26],
      [716, 142, 24],
      [948, 164, 19],
      [1168, 132, 26],
    ],
    details: ['M318,128 L296,206', 'M716,142 L740,218', 'M1168,132 L1146,212', 'M948,164 L962,224'],
  },
  {
    h: 63,
    ridge:
      'M0,338 L88,296 L182,196 L238,258 L322,222 L402,156 L468,252 L548,210 L628,300 L712,236 L796,170 L862,258 L948,222 L1036,158 L1112,262 L1196,224 L1284,166 L1356,266 L1444,230 L1520,282 L1600,252',
    caps: [
      [402, 156, 20],
      [1036, 158, 20],
      [1284, 166, 18],
      [796, 170, 17],
    ],
    details: ['M402,156 L386,226', 'M1036,158 L1054,232', 'M1284,166 L1268,234'],
  },
  {
    h: 55,
    ridge:
      'M0,372 L132,318 Q172,300 212,322 L342,252 L432,330 Q472,352 516,334 L634,272 L744,348 L862,290 Q902,272 942,296 L1058,358 L1180,284 L1296,352 Q1338,372 1382,352 L1488,300 L1600,356',
    details: ['M342,252 L362,330', 'M1180,284 L1160,352'],
  },
  {
    h: 48,
    ridge:
      'M0,408 Q96,376 192,392 L320,338 Q368,322 416,342 L536,398 Q600,420 664,398 L792,344 Q848,326 904,348 L1016,400 Q1080,424 1144,402 L1272,350 Q1330,330 1388,352 L1496,398 Q1548,414 1600,408',
  },
  {
    h: 41,
    ridge:
      'M0,446 Q120,414 240,432 Q360,450 480,428 Q600,406 720,430 Q840,454 960,432 Q1080,410 1200,434 Q1320,458 1440,438 Q1520,426 1600,438',
  },
  {
    h: 34,
    ridge:
      'M0,478 Q140,500 280,484 Q420,468 560,492 Q700,514 840,492 Q980,472 1120,496 Q1260,518 1400,498 Q1500,484 1600,496',
    firs: [
      [92, 486, 66],
      [148, 492, 46],
      [508, 488, 72],
      [572, 496, 52],
      [1052, 492, 68],
      [1124, 498, 48],
      [1454, 494, 62],
      [1518, 500, 44],
    ],
  },
];

/** Schneekappe (Website `cap(x,y,w)`). */
export function capPath(x: number, y: number, w: number): string {
  return `M${x - w},${y + w * 0.92} L${x},${y} L${x + w},${y + w * 0.92} L${x + w * 0.52},${y + w * 0.6} L${x + w * 0.18},${y + w * 0.98} L${x - w * 0.22},${y + w * 0.62} Z`;
}

/** Tanne (Website `fir(x,b,h)`). */
export function firPath(x: number, b: number, h: number): string {
  return `M${x},${b - h} L${x - h * 0.3},${b - h * 0.55} L${x - h * 0.14},${b - h * 0.55} L${x - h * 0.4},${b - h * 0.26} L${x - h * 0.2},${b - h * 0.26} L${x - h * 0.5},${b} L${x + h * 0.5},${b} L${x + h * 0.2},${b - h * 0.26} L${x + h * 0.4},${b - h * 0.26} L${x + h * 0.14},${b - h * 0.55} L${x + h * 0.3},${b - h * 0.55} Z`;
}

/**
 * Ruhelage einer Ebene (Website: `rest = (h+16)·(0.32 + i·0.112)` in vh):
 * hintere Ketten lugen über den Horizont, vordere liegen tiefer.
 */
export function restOffset(index: number): number {
  const base = RANGES[index].h + 16;
  return base * (0.32 + index * 0.112);
}

/**
 * Näherung der Pfadlänge für den Skizzenstrich (RN-SVG kennt kein
 * getTotalLength). Unterstützt die hier genutzten absoluten Befehle M, L, Q.
 */
export function approxPathLength(d: string): number {
  const tokens = d.match(/[MLQ]|-?\d*\.?\d+/g) ?? [];
  let length = 0;
  let x = 0;
  let y = 0;
  let i = 0;
  let cmd = 'M';
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLQ]/.test(tokens[i])) {
      cmd = tokens[i++];
    }
    if (cmd === 'M') {
      x = num();
      y = num();
      cmd = 'L';
    } else if (cmd === 'L') {
      const nx = num();
      const ny = num();
      length += Math.hypot(nx - x, ny - y);
      x = nx;
      y = ny;
    } else if (cmd === 'Q') {
      const cx = num();
      const cy = num();
      const nx = num();
      const ny = num();
      // quadratische Bézierkurve in 12 Segmenten abtasten
      let px = x;
      let py = y;
      for (let s = 1; s <= 12; s += 1) {
        const t = s / 12;
        const qx = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * nx;
        const qy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ny;
        length += Math.hypot(qx - px, qy - py);
        px = qx;
        py = qy;
      }
      x = nx;
      y = ny;
    }
  }
  return length;
}
