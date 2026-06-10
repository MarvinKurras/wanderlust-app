/** Abstands- und Radius-Skala (4er-Raster; Radien nach Website: Pills 40, Cards 14). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  card: 14,
  chip: 8,
  pill: 40,
  /** Bottom Sheet (Website: karte.html .sheet 26px) */
  sheet: 26,
} as const;
