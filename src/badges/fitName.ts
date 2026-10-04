import type { BadgeShape } from '@/lib/places';

import { CENTER, FIELD_SCALE as FIELD, fieldHalfWidth, NAILS } from './geometry';

/**
 * Laufweiten von Cormorant 600 (Versalien, Ziffern, Satzzeichen) in em —
 * im Browser mit der gebündelten Schrift gemessen (A-D2-3).
 */
const CORMORANT_600: Record<string, number> = {
  A: 0.71,
  B: 0.58,
  C: 0.67,
  D: 0.7,
  E: 0.55,
  F: 0.52,
  G: 0.72,
  H: 0.76,
  I: 0.34,
  J: 0.33,
  K: 0.65,
  L: 0.54,
  M: 0.85,
  N: 0.73,
  O: 0.77,
  P: 0.55,
  Q: 0.77,
  R: 0.69,
  S: 0.51,
  T: 0.64,
  U: 0.7,
  V: 0.66,
  W: 0.92,
  X: 0.65,
  Y: 0.62,
  Z: 0.6,
  Ä: 0.71,
  Ö: 0.77,
  Ü: 0.7,
  '0': 0.48,
  '1': 0.33,
  '2': 0.4,
  '3': 0.39,
  '4': 0.45,
  '5': 0.41,
  '6': 0.46,
  '7': 0.43,
  '8': 0.49,
  '9': 0.46,
  ' ': 0.23,
  '.': 0.2,
  '-': 0.32,
  '&': 0.71,
  '·': 0.19,
  "'": 0.15,
};
const FALLBACK_EM = 0.62;
/** Spline Sans Mono: jedes Zeichen 0,6 em. */
export const MONO_EM = 0.6;

/** Laufweite relativ zur Schriftgröße (Sperrung ebenfalls in em). */
const TRACKING_EM = 0.05;

const MAX_FS = 19.5;
const MIN_FS_ONE_LINE = 15;
const MAX_FS_TWO_LINES = 15.5;
/** Untergrenze nur für Extremfälle (lange Einzelwörter im Oval) — die 15 Seeds liegen darüber. */
const MIN_FS = 8.5;
/** Innenabstand zum Rand der Form (je Seite, viewBox-Einheiten). */
const SIDE_PAD = 10;
const NAIL_R = 4.5;
const NAIL_GAP = 3;

/** Breite eines Versal-Strings bei Schriftgröße 1 (inkl. Sperrung). */
export function nameWidthEm(text: string): number {
  const chars = [...text];
  const glyphs = chars.reduce((sum, ch) => sum + (CORMORANT_600[ch] ?? FALLBACK_EM), 0);
  return glyphs + TRACKING_EM * Math.max(0, chars.length - 1);
}

/** Verfügbare Breite für eine Zeile mit Grundlinie `baseline` und Größe `fs`. */
function budget(shape: BadgeShape, baseline: number, fs: number): number {
  // Die engste Stelle der Zeile ist ihre Oberkante (Versalhöhe ~0,65 em).
  const top = baseline - fs * 0.65;
  let half = Math.min(fieldHalfWidth(shape, top), fieldHalfWidth(shape, baseline)) - SIDE_PAD;
  // Nieten auf Zeilenhöhe begrenzen die Breite zusätzlich
  for (const [nx, ny] of NAILS[shape]) {
    const x = Math.abs((nx - CENTER.x) / FIELD);
    const y = (ny - CENTER.y) / FIELD + CENTER.y;
    const r = NAIL_R / FIELD;
    if (y + r + NAIL_GAP > top && y - r - NAIL_GAP < baseline) {
      half = Math.min(half, x - r - NAIL_GAP);
    }
  }
  return 2 * half;
}

/** Größte Schrift, bei der `text` auf Grundlinie `baseline` passt (Fixpunkt-Iteration). */
function fitSize(shape: BadgeShape, text: string, baseline: number, max: number): number {
  const em = nameWidthEm(text);
  let fs = max;
  for (let i = 0; i < 4; i += 1) {
    fs = Math.min(max, budget(shape, baseline, fs) / em);
  }
  return fs;
}

/** Trennstellen: Leerzeichen (entfällt) oder nach Bindestrich (bleibt stehen). */
function splits(text: string): [string, string][] {
  const out: [string, string][] = [];
  [...text].forEach((ch, i) => {
    if (ch === ' ') out.push([text.slice(0, i), text.slice(i + 1)]);
    if (ch === '-' && i > 0 && i < text.length - 1)
      out.push([text.slice(0, i + 1), text.slice(i + 1)]);
  });
  return out;
}

export type NameLayout = {
  lines: string[];
  fontSize: number;
  letterSpacing: number;
  /** Grundlinien der Namenszeilen (Koordinaten des eingelassenen Feldes). */
  baselines: number[];
  /** Grundlinie der Regionszeile. */
  regionBaseline: number;
  /** Trennlinie mit Raute — nur bei einzeiligem Namen (sonst zu eng). */
  dividerY: number | null;
};

/**
 * Grundlinien im Namensband (Band endet bei y 86). Das Oval ist oben schmal —
 * sein Block sitzt etwas tiefer, wo die Form breiter wird.
 */
const LAYOUT: Record<
  BadgeShape,
  { one: { name: number; divider: number; region: number }; two: [number, number, number] }
> = {
  shield: { one: { name: 55, divider: 63.5, region: 75 }, two: [47, 63, 77] },
  arch: { one: { name: 55, divider: 63.5, region: 75 }, two: [47, 63, 77] },
  oval: { one: { name: 60, divider: 68, region: 79 }, two: [53, 68, 80] },
};

/**
 * Satz des Ortsnamens im Namensband: einzeilig so groß wie möglich (≤ 21),
 * sonst zweizeilig an der ausgewogensten Trennstelle, notfalls kleiner bis 10,5.
 */
export function fitName(name: string, shape: BadgeShape): NameLayout {
  const text = name.toUpperCase();
  const { one, two } = LAYOUT[shape];
  const single = fitSize(shape, text, one.name, MAX_FS);
  if (single >= MIN_FS_ONE_LINE || splits(text).length === 0) {
    const fs = Math.max(MIN_FS, single);
    return {
      lines: [text],
      fontSize: round(fs),
      letterSpacing: round(fs * TRACKING_EM),
      baselines: [one.name],
      regionBaseline: one.region,
      dividerY: one.divider,
    };
  }

  let best: { lines: [string, string]; fs: number } | null = null;
  for (const [a, b] of splits(text)) {
    const fs = Math.min(
      fitSize(shape, a, two[0], MAX_FS_TWO_LINES),
      fitSize(shape, b, two[1], MAX_FS_TWO_LINES),
    );
    if (!best || fs > best.fs) best = { lines: [a, b], fs };
  }
  const fs = Math.max(MIN_FS, best!.fs);
  return {
    lines: best!.lines,
    fontSize: round(fs),
    letterSpacing: round(fs * TRACKING_EM),
    baselines: [two[0], two[1]],
    regionBaseline: two[2],
    dividerY: null,
  };
}

const REGION_FS = 7.6;
const REGION_LS = 1.5;
/** Kleiner wirkt die Mono-Zeile wie Kleingedrucktes — dann lieber kürzen. */
const REGION_SHORTEN_BELOW = 6.2;

function monoWidth(text: string, fs: number, ls: number) {
  const n = [...text].length;
  return n * fs * MONO_EM + Math.max(0, n - 1) * ls;
}

/** Breiteste Namenszeile in viewBox-Einheiten. */
export function nameWidth(layout: NameLayout): number {
  return Math.max(...layout.lines.map((l) => nameWidthEm(l) * layout.fontSize));
}

/**
 * Regionszeile (Spline Mono): Standardgröße, in schmalen Formen proportional
 * verkleinert und nie breiter als der Name darüber (Hierarchie Name > Region).
 * Würde sie zu klein, bleibt nur der erste Teil („LADENBURG · KURPFALZ" → „LADENBURG").
 */
export function fitRegion(region: string, shape: BadgeShape, layout: NameLayout) {
  const limit = Math.min(budget(shape, layout.regionBaseline, REGION_FS), nameWidth(layout) * 1.05);
  const fit = (text: string) => {
    const k = Math.min(1, limit / monoWidth(text, REGION_FS, REGION_LS));
    return { text, fontSize: round(REGION_FS * k), letterSpacing: round(REGION_LS * k) };
  };
  const full = fit(region);
  if (full.fontSize >= REGION_SHORTEN_BELOW || !region.includes(' · ')) return full;
  return fit(region.split(' · ')[0]);
}

const BAND = { fs: 11, ls: 1.8 } as const;
/** Grundlinie im Höhenband — das Schild läuft unten spitz zu, dort etwas höher. */
const BAND_BASELINE: Record<BadgeShape, number> = { shield: 219, arch: 224, oval: 224 };

/** Satz des unteren Bands: Grundlinie und (falls Platz) Abstand der Rauten. */
export function fitBand(text: string, shape: BadgeShape) {
  const baseline = BAND_BASELINE[shape];
  const half = monoWidth(text, BAND.fs, BAND.ls) / 2;
  const ornamentX = half + 7;
  const room = fieldHalfWidth(shape, baseline - 4) - 8;
  return {
    baseline,
    fontSize: BAND.fs,
    letterSpacing: BAND.ls,
    halfWidth: half,
    ornamentX: room > ornamentX ? ornamentX : null,
  };
}

function round(v: number) {
  return Math.round(v * 10) / 10;
}
