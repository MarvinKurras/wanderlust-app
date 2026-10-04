import { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Typografie-Tokens nach Website-Vorbild:
 * Cormorant (Display/Ortsnamen), Hanken Grotesk (UI/Fließtext),
 * Spline Sans Mono (Labels/Koordinaten/Eyebrows).
 * Die Font-Keys entsprechen den in `src/app/_layout.tsx` geladenen Schnitten.
 */
export const fonts = {
  displayLight: 'Cormorant_300Light',
  display: 'Cormorant_400Regular',
  displayMedium: 'Cormorant_500Medium',
  displaySemiBold: 'Cormorant_600SemiBold',
  displayItalic: 'Cormorant_400Regular_Italic',
  sans: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemiBold: 'HankenGrotesk_600SemiBold',
  mono: 'SplineSansMono_400Regular',
  monoMedium: 'SplineSansMono_500Medium',
} as const;

/** Wiederkehrende Textstile (Website: .wordmark, .eyebrow, .lead, .bs). */
export const textStyles = {
  /** Große Serif-Headline, z. B. Screen-Titel / Ortsname */
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  /** Mono-Eyebrow: uppercase, gesperrt, brass-deep */
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.brassDeep,
  },
  /** Fließtext */
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    color: colors.inkSoft,
  },
  /** Kleine Mono-Labels (Höhe, Region, Koordinaten) */
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  /** Wortmarke / Hero (Website: .wordmark, Cormorant leicht) */
  hero: {
    fontFamily: fonts.displayLight,
    fontSize: 58,
    lineHeight: 60,
    letterSpacing: -1,
    color: colors.ink,
  },
  /** Ortsname in Karten und Sheets */
  name: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    lineHeight: 27,
    color: colors.ink,
  },
  /** Poetische Zeile (Cormorant kursiv) */
  verse: {
    fontFamily: fonts.displayItalic,
    fontSize: 20,
    lineHeight: 26,
    color: colors.inkSoft,
  },
  /** Bedienelemente: Mono, gesperrt */
  control: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  /** Große Zählzahl (Fortschritt) */
  numeral: {
    fontFamily: fonts.displayMedium,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -1.5,
    color: colors.ink,
  },
} as const satisfies Record<string, TextStyle>;
