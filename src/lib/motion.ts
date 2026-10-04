import { Easing, type WithSpringConfig } from 'react-native-reanimated';

/**
 * Zentrale Bewegungs-Parameter (AP-D). Werte aus dem Spielesammlungs-Redesign,
 * das den gewünschten Feel trifft; Kurven der Website (`cubic-bezier(.2,.8,.2,1)`
 * für Reveals, `(.2,.9,.3,1.2)` für den Präge-Pop) als Easings.
 */
export const motionSprings = {
  /** Druck auf Buttons/Kacheln: schnell rein, knackig. */
  press: { damping: 18, stiffness: 420, mass: 0.6 } satisfies WithSpringConfig,
  /** Loslassen: federt mit einem Hauch Überschwingen zurück. */
  release: { damping: 11, stiffness: 260, mass: 0.7 } satisfies WithSpringConfig,
  /** Sheets, Dialoge, Indikatoren: weich, aber zielstrebig. */
  sheet: { damping: 20, stiffness: 190, mass: 0.9 } satisfies WithSpringConfig,
  /** Auftritte mit Charakter (Schilder, Marken). */
  pop: { damping: 10, stiffness: 180, mass: 0.8 } satisfies WithSpringConfig,
  /** Landung ohne Überschwingen. */
  land: {
    damping: 22,
    stiffness: 210,
    mass: 0.9,
    overshootClamping: true,
  } satisfies WithSpringConfig,
} as const;

export const motionEasings = {
  /** Website `.reveal`: cubic-bezier(.2,.8,.2,1) */
  reveal: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** Website Skizzen-Strich `mDraw`: cubic-bezier(.65,.05,.36,1) */
  draw: Easing.bezier(0.65, 0.05, 0.36, 1),
  /** karte.html `pop`: cubic-bezier(.2,.9,.3,1.2) */
  pop: Easing.bezier(0.2, 0.9, 0.3, 1.2),
  fade: Easing.inOut(Easing.quad),
} as const;

export const motionDurations = {
  fade: 250,
  reveal: 700,
  /** Abstand gestaffelter Einblendungen (Listen, Grid) */
  stagger: 45,
} as const;

/** Gestaffelte Verzögerung, gedeckelt — lange Listen sollen nicht nachtröpfeln. */
export function staggerDelay(index: number, max = 10): number {
  return Math.min(index, max) * motionDurations.stagger;
}
