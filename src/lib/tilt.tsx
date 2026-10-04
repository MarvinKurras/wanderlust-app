import { createContext, type ReactNode, useContext } from 'react';
import { Platform } from 'react-native';
import {
  SensorType,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedSensor,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

/**
 * Geräteneigung als gemeinsamer Shared Value (x/y jeweils etwa −1…1), Muster
 * aus der Spielesammlung. Ein Sensor für die ganze App — Bergparallaxe und
 * Messingglanz lesen nur mit. Die Grundhaltung wird laufend nachgeführt, damit
 * jede Haltung neutral wirkt und nur Bewegung zählt. Kein Standortbezug.
 */
export type Tilt = { x: number; y: number };

const TiltContext = createContext<SharedValue<Tilt> | null>(null);

const MAX_RAD = 0.35;
/** Wie schnell sich die Grundhaltung an die aktuelle Neigung anpasst (0–1 pro Frame). */
const RECENTER = 0.018;

function clamp(value: number) {
  'worklet';
  return Math.max(-1, Math.min(1, value));
}

function NativeTiltProvider({ children }: { children: ReactNode }) {
  const tilt = useSharedValue<Tilt>({ x: 0, y: 0 });
  const base = useSharedValue<Tilt>({ x: 0, y: 0 });
  const primed = useSharedValue(false);
  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 'auto' });

  useAnimatedReaction(
    () => sensor.sensor.value,
    (value) => {
      if (!primed.value) {
        base.value = { x: value.roll, y: value.pitch };
        primed.value = true;
      }
      const bx = base.value.x + (value.roll - base.value.x) * RECENTER;
      const by = base.value.y + (value.pitch - base.value.y) * RECENTER;
      base.value = { x: bx, y: by };
      tilt.value = {
        x: clamp((value.roll - bx) / MAX_RAD),
        y: clamp((value.pitch - by) / MAX_RAD),
      };
    },
  );

  return <TiltContext.Provider value={tilt}>{children}</TiltContext.Provider>;
}

function StaticTiltProvider({ children }: { children: ReactNode }) {
  const tilt = useSharedValue<Tilt>({ x: 0, y: 0 });
  return <TiltContext.Provider value={tilt}>{children}</TiltContext.Provider>;
}

export function TiltProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  if (Platform.OS === 'web' || reducedMotion) {
    return <StaticTiltProvider>{children}</StaticTiltProvider>;
  }
  return <NativeTiltProvider>{children}</NativeTiltProvider>;
}

/** Aktuelle Neigung; ohne Provider (z. B. in Tests) immer neutral. */
export function useTilt(): SharedValue<Tilt> {
  const fallback = useSharedValue<Tilt>({ x: 0, y: 0 });
  return useContext(TiltContext) ?? fallback;
}
