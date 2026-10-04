import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Coords = { lat: number; lng: number };

/**
 * Letzte bekannte Position für die Distanzanzeige (A-R3-2): nur wenn die
 * Standort-Permission bereits erteilt ist — kein Prompt, kein Abo, einmalig,
 * `Accuracy.Balanced`. Die Unlock-Messung (`Accuracy.High`) bleibt allein in
 * `useUnlock.ts`; hier fällt keine Freischalt-Entscheidung.
 */
export function useKnownPosition(): Coords | null {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) return;
        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        if (position && !cancelled) {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        }
      } catch {
        // ohne Standortdienst bleibt die Distanz einfach aus
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}
