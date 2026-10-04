import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Kleine Haptik-Choreografie über expo-haptics (AP-D). Auf Web ist alles ein
 * No-op; Fehler (z. B. kein Haptik-Support) werden geschluckt.
 */
const isWeb = Platform.OS === 'web';

/** Leichter Tick beim Antippen. */
export function tick(): void {
  if (isWeb) return;
  Haptics.selectionAsync().catch(() => {});
}

export function impact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
): void {
  if (isWeb) return;
  Haptics.impactAsync(style).catch(() => {});
}

export function success(): void {
  if (isWeb) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warning(): void {
  if (isWeb) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** Zeitpunkte der drei Hammerschläge der Prägung (ms) — die Animation nutzt dieselben. */
export const PRAEGE_SCHLAEGE_MS = [420, 760, 1100] as const;

/**
 * Prägung: drei Hammerschläge (stark, stark, satt), danach Erfolg.
 * Gibt eine cancel-Funktion zurück (z. B. wenn der Screen verlassen wird).
 */
export function praege(): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  if (!isWeb) {
    const styles = [
      Haptics.ImpactFeedbackStyle.Medium,
      Haptics.ImpactFeedbackStyle.Heavy,
      Haptics.ImpactFeedbackStyle.Rigid,
    ];
    PRAEGE_SCHLAEGE_MS.forEach((ms, i) => timers.push(setTimeout(() => impact(styles[i]), ms)));
    timers.push(setTimeout(success, PRAEGE_SCHLAEGE_MS[2] + 260));
  }
  return () => timers.forEach(clearTimeout);
}
