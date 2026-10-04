import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { withTimeout } from '@/lib/async';

export type Coords = { lat: number; lng: number };

/** Ältere oder gröbere Positionen taugen nicht für die Distanzanzeige. */
const MAX_AGE_MS = 5 * 60_000;
const REQUIRED_ACCURACY_M = 1000;
const TIMEOUT_MS = 10_000;

/**
 * Eine frische Position für die Anzeige: zuerst die letzte bekannte (nur wenn
 * jung und grob genau), sonst eine einmalige Messung mit `Accuracy.Balanced`
 * und Timeout. Wirft nie — ohne Position bleibt die Distanz einfach aus.
 */
async function readPosition(): Promise<Coords | null> {
  try {
    const position =
      (await Location.getLastKnownPositionAsync({
        maxAge: MAX_AGE_MS,
        requiredAccuracy: REQUIRED_ACCURACY_M,
      })) ??
      (await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        TIMEOUT_MS,
      ));
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch {
    return null;
  }
}

/**
 * Bekannte Position für Distanzanzeige und Karten-Standortpunkt (A-R3-2, A-D-6).
 * Ohne Prompt: gelesen wird nur bei bereits erteilter Permission, einmalig bei
 * jedem Fokus des Screens — kein Abo, keine Bewegungsdaten. `locate()` fragt die
 * Permission auf ausdrücklichen Tap an. Die Unlock-Messung (`Accuracy.High`) bleibt
 * allein in `useUnlock.ts`; hier fällt keine Freischalt-Entscheidung.
 */
export function useKnownPosition() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [granted, setGranted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (cancelled || status !== Location.PermissionStatus.GRANTED) return;
          setGranted(true);
          const next = await readPosition();
          if (next && !cancelled) setCoords(next);
        } catch {
          // ohne Standortdienst bleibt die Distanz einfach aus
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  /** Expliziter Tap: Permission anfragen, dann messen. `null` bei Ablehnung oder ohne Fix. */
  const locate = useCallback(async (): Promise<Coords | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) return null;
    } catch {
      return null;
    }
    setGranted(true);
    const next = await readPosition();
    if (next) setCoords(next);
    return next;
  }, []);

  return { coords, granted, locate };
}
