import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  makeMutable,
  SensorType,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedSensor,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { useAppActive } from './screenActive';

/**
 * Geräteneigung als gemeinsamer Shared Value (x/y jeweils etwa −1…1), Muster
 * aus der Spielesammlung. Ein Sensor für die ganze App — Bergparallaxe und
 * Messingglanz lesen nur mit. Die Grundhaltung wird laufend nachgeführt, damit
 * jede Haltung neutral wirkt und nur Bewegung zählt. Kein Standortbezug, nichts
 * wird gespeichert.
 *
 * Der Sensor läuft nur, solange ein sichtbarer Konsument ihn hält (`useTilt(true)`)
 * und die App im Vordergrund ist — sonst ist er abgemeldet.
 */
export type Tilt = { x: number; y: number };

type TiltContextValue = {
  tilt: SharedValue<Tilt>;
  /** Meldet einen Konsumenten an; die Rückgabe meldet ihn wieder ab. */
  retain: () => () => void;
};

const TiltContext = createContext<TiltContextValue | null>(null);

/** Neutrale Neigung für Tests, Web und abgeschaltete Konsumenten. */
const NEUTRAL = makeMutable<Tilt>({ x: 0, y: 0 });

const MAX_RAD = 0.35;
/** Wie schnell sich die Grundhaltung an die aktuelle Neigung anpasst (0–1 pro Messung). */
const RECENTER = 0.03;
/** ~30 Hz reichen für Glanz und Parallaxe; spart gegenüber Display-Takt (60/120 Hz). */
const INTERVAL_MS = 33;
/** Kleinere Änderungen werden verworfen — ein ruhig gehaltenes Handy zeichnet nichts neu. */
const DEADBAND = 0.004;

function clamp(value: number) {
  'worklet';
  return Math.max(-1, Math.min(1, value));
}

/** Der eigentliche Sensor — nur gemountet, solange jemand mitliest. */
function TiltSensor({ tilt }: { tilt: SharedValue<Tilt> }) {
  const base = useSharedValue<Tilt>({ x: 0, y: 0 });
  const primed = useSharedValue(false);
  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: INTERVAL_MS });

  useAnimatedReaction(
    () => sensor.sensor.value,
    (value) => {
      if (!primed.get()) {
        base.set({ x: value.roll, y: value.pitch });
        primed.set(true);
      }
      const prevBase = base.get();
      const bx = prevBase.x + (value.roll - prevBase.x) * RECENTER;
      const by = prevBase.y + (value.pitch - prevBase.y) * RECENTER;
      base.set({ x: bx, y: by });
      const nx = clamp((value.roll - bx) / MAX_RAD);
      const ny = clamp((value.pitch - by) / MAX_RAD);
      const current = tilt.get();
      if (Math.abs(nx - current.x) > DEADBAND || Math.abs(ny - current.y) > DEADBAND) {
        tilt.set({ x: nx, y: ny });
      }
    },
  );

  // Beim Abmelden in die Ruhelage zurück, damit nichts schief stehen bleibt.
  useEffect(() => () => tilt.set({ x: 0, y: 0 }), [tilt]);

  return null;
}

function NativeTiltProvider({ children }: { children: ReactNode }) {
  const tilt = useSharedValue<Tilt>({ x: 0, y: 0 });
  const [consumers, setConsumers] = useState(0);
  const appActive = useAppActive();

  const retain = useCallback(() => {
    setConsumers((n) => n + 1);
    return () => setConsumers((n) => n - 1);
  }, []);
  const value = useMemo(() => ({ tilt, retain }), [tilt, retain]);

  return (
    <TiltContext.Provider value={value}>
      {consumers > 0 && appActive ? <TiltSensor tilt={tilt} /> : null}
      {children}
    </TiltContext.Provider>
  );
}

const noRetain = () => () => undefined;

function StaticTiltProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ tilt: NEUTRAL, retain: noRetain }), []);
  return <TiltContext.Provider value={value}>{children}</TiltContext.Provider>;
}

export function TiltProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  if (Platform.OS === 'web' || reducedMotion) {
    return <StaticTiltProvider>{children}</StaticTiltProvider>;
  }
  return <NativeTiltProvider>{children}</NativeTiltProvider>;
}

/**
 * Aktuelle Neigung; ohne Provider (z. B. in Tests) immer neutral.
 * `active` hält den Sensor am Laufen — `false` für unsichtbare Screens
 * oder Konsumenten ohne Bewegung (z. B. Bergketten ohne Parallaxe).
 */
export function useTilt(active = true): SharedValue<Tilt> {
  const ctx = useContext(TiltContext);
  useEffect(() => {
    if (!active || !ctx) return;
    return ctx.retain();
  }, [active, ctx]);
  return ctx?.tilt ?? NEUTRAL;
}
