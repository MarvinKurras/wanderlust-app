import { useIsFocused } from 'expo-router';
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

function subscribe(onChange: () => void) {
  const sub = AppState.addEventListener('change', onChange);
  return () => sub.remove();
}

function appIsActive() {
  return AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
}

/** Ist die App im Vordergrund? (iOS „inactive" — z. B. Kontrollzentrum — zählt als pausiert.) */
export function useAppActive(): boolean {
  return useSyncExternalStore(subscribe, appIsActive, () => true);
}

/**
 * Ist dieser Screen gerade sichtbar? Tabs bleiben gemountet, Stack-Screens
 * liegen unter dem Detail — Dauerschleifen (Nebel, Sterne, Wolken, Glanz,
 * Neigung) pausieren dann, damit Akku und UI-Thread geschont werden.
 * Nur innerhalb eines Navigators verwenden.
 */
export function useScreenActive(): boolean {
  const focused = useIsFocused();
  const appActive = useAppActive();
  return focused && appActive;
}

/** CSS-Animationswert für `animationPlayState`. */
export function playState(active: boolean): 'running' | 'paused' {
  return active ? 'running' : 'paused';
}
