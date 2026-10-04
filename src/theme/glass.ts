/**
 * Glas-Tokens (AP-D). Pergament-Glas = Website `karte.html --glass`
 * (rgba(236,225,205,.82)); Tannen-Glas für die Sammlung. Ohne Blur (Android)
 * werden die kräftigeren `*Strong`-Füllungen genutzt, damit Text lesbar bleibt.
 */
export const glass = {
  paperFill: 'rgba(236,225,205,0.82)',
  paperFillStrong: 'rgba(236,225,205,0.95)',
  /** Website karte.html: .5px rgba(255,255,255,.4–.5) */
  paperBorder: 'rgba(255,255,255,0.5)',
  paperHighlight: 'rgba(255,255,255,0.45)',
  /** Ende des Lichtverlaufs (transparent) */
  highlightEnd: 'rgba(255,255,255,0)',
  /** Tönung für echtes Liquid Glass (iOS 26) */
  paperTint: 'rgba(236,225,205,0.42)',
  pineFill: 'rgba(39,51,43,0.7)',
  pineFillStrong: 'rgba(39,51,43,0.95)',
  pineBorder: 'rgba(243,234,215,0.14)',
  pineHighlight: 'rgba(255,255,255,0.07)',
  pineTint: 'rgba(28,38,32,0.45)',
  /** Lichtstreif des Messingglanzes (Website `badges.js` glint: #fff, Spitze .7) */
  sheen: '#ffffff',
  sheenPeak: 0.7,
} as const;

/** Schatten als `boxShadow` (RN ≥ 0.76, alle Plattformen inkl. Web). Farbe: ink. */
export const shadows = {
  card: '0px 6px 16px rgba(29,38,32,0.10)',
  float: '0px 10px 28px rgba(29,38,32,0.18)',
  sheet: '0px -8px 32px rgba(29,38,32,0.16)',
  brassButton: '0px 6px 14px rgba(125,88,38,0.35)',
  pine: '0px 10px 30px rgba(0,0,0,0.35)',
  /** Glühen der Messingfunken bei der Prägung */
  spark: '0px 0px 6px rgba(244,221,155,0.9)',
  /** Website `badges.js` feDropShadow (dy 2, stdDeviation 2.4, ink .4) als CSS-Filter */
  badgeDrop: 'drop-shadow(0px 2px 2.4px rgba(29,38,32,0.4))',
} as const;
