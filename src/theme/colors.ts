/**
 * Farb-Tokens der Wanderlust-Marke.
 * Quelle: Website-Repo `wanderlust/index.html` (:root) und `badges.js` (TONES).
 * Werte nicht verändern — Design-Treue zur Website ist Akzeptanzkriterium.
 */
export const colors = {
  ink: '#1d2620',
  inkSoft: '#3c4a40',
  paper: '#ece1cd',
  paperDeep: '#e3d5bb',
  paperLine: '#cdbf9f',
  pine: '#1c2620',
  pineSoft: '#27332b',
  brass: '#bb8b4b',
  brassLight: '#e9cd86',
  brassDeep: '#7d5826',
  /** Heller Text auf Pine-Flächen (Website: .collection / .cta) */
  paperOnPine: '#f3ead7',
  /** Glass-Chips auf der Karte (Website: karte.html --glass) */
  glass: 'rgba(236,225,205,0.82)',
  /** Gedimmter heller Text auf Pine (Website: badges.js .bs / .badge-card.locked .bn) */
  paperOnPineDim: 'rgba(239,229,210,0.5)',
  /** Fließtext auf Pine (Website: index.html .collection .lead) */
  leadOnPine: 'rgba(239,229,210,0.66)',
  /** Pip „noch nicht erwandert" (Website: badges.js .bm-status.locked .bm-pip) */
  lockedGray: '#9aa39c',
  /** Art-Panel hinter dem Badge (Website: badges.js .bm-art radial-gradient) */
  artPanelFrom: '#33453a',
  artPanelTo: '#161e18',
  /** Fog-of-War-Schleier (Website: karte.html .fog .veil, Radial von innen nach außen) */
  fogInner: '#f5f0e5',
  fogMid: '#f0e9d8',
  fogOuter: '#eee6d4',
  /** Pin-Stiel (Website: karte.html .pin .stem, Gradient brass-deep → dunkel) */
  stemDark: '#3c2a12',
  /** Modal-/Sheet-Scrim (Website: badges.js .bm-backdrop rgba(18,24,20,.62)) */
  scrim: 'rgba(18,24,20,0.62)',
  /** Gedämpfte Locked-Texte in Karten-Chips (Website: karte.html .chip.locked .cn/.cm) */
  lockedTextStrong: 'rgba(60,74,64,0.6)',
  lockedTextSoft: 'rgba(60,74,64,0.5)',
  /** Hintergrund des Schloss-Icons im Locked-Chip (Website: .chip.locked .cmedal) */
  lockedMedalBg: 'rgba(60,74,64,0.14)',
} as const;

/** Metallton-Gradienten der Stockschilder (Website: badges.js TONES). */
export const badgeTones = {
  brass: { hi: '#f4dd9b', mid: '#c89c54', lo: '#7c531e', edge: '#5e3d12' },
  silver: { hi: '#f4f6f4', mid: '#bfc7c2', lo: '#727d77', edge: '#4f5852' },
  copper: { hi: '#f1c197', mid: '#c1774a', lo: '#723a1f', edge: '#522714' },
  pewter: { hi: '#dfe4df', mid: '#9aa39c', lo: '#5a635c', edge: '#3c443e' },
} as const;

export type BadgeTone = keyof typeof badgeTones;
