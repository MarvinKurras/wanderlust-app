import { colors } from './colors';

/**
 * Farben der Bergbühne (AP-D, A-D-1).
 * Quelle: Website-Hero — `wanderlust/app.js` (LAYERS, Wolken, Vögel) und
 * `wanderlust/index.html` (:root --sky-*, .sun). Die Nacht-Töne der Sammlung
 * sind die Website-Ketten, in Tannen-Nacht abgedunkelt (abgeleitet, nicht im Web).
 */
export const landscape = {
  skyTop: '#aebfbd',
  skyMid: '#d2cab9',
  skyLow: '#f1e3c8',
  /** Sonne: Kern und Halo (index.html .sun / .sun::after) */
  sunCore: '#fff6e2',
  sunWarm: '#f0d9a6',
  sunHalo: '#fff7e4',
  sunHaloWarm: '#f3ddb0',
  /** Sechs Bergketten, hinten (hell) → vorne (dunkel) */
  ridges: ['#b6c3be', '#9aaca4', '#7f938a', '#62766c', '#445648', '#28352c'],
  snow: '#f7f7ee',
  fir: '#1f2b23',
  /** Bleistiftstrich der Skizze */
  sketch: '#2b3a30',
  cloudFill: '#faf7ee',
  cloudStroke: '#5d6f63',
  /** Nacht der Sammlung */
  nightSky: '#141c17',
  nightRidges: ['#34443a', '#2d3b32', '#26322a', '#1f2a23', '#19221c', '#121914'],
  star: colors.paperOnPine,
  moonGlow: colors.brassLight,
  /** Nebel (karte.html .fog .veil) */
  fog: colors.fogInner,
  fogDeep: colors.fogOuter,
  nightFog: colors.inkSoft,
} as const;
