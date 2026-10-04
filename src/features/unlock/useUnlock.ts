import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { unlocksQueryKey } from '@/features/places/queries';
import { de } from '@/i18n/de';
import { sleep, withTimeout } from '@/lib/async';
import { ensureSession } from '@/lib/auth';
import { isPreview, previewUnlock } from '@/lib/preview';
import { supabase } from '@/lib/supabase';

import {
  type EdgeResponse,
  stateFromError,
  stateFromResponse,
  type UnlockState,
} from './unlockOutcome';

export type { UnlockState } from './unlockOutcome';

const LOCATION_TIMEOUT_MS = 15_000;
const REMEASURE_THRESHOLD_M = 50; // §9: bei accuracy > 50 m bis zu 2× nachmessen
const MAX_MEASUREMENTS = 3;
/** Kurze Pause vor einer Nachmessung — sonst liefert das OS oft denselben Fix erneut. */
const REMEASURE_PAUSE_MS = 1500;

type Measurement = { best: Location.LocationObject; anyMocked: boolean };

/**
 * Beste Messung: misst bis zu 3×, bricht ab sobald accuracy ≤ 50 m (§9).
 * Ein Timeout einzelner Nachmessungen verwirft eine bereits vorhandene
 * (ungenauere) Messung nicht — nur ohne jede Messung wird geworfen.
 * `anyMocked` merkt sich, ob irgendeine Messung simuliert war (Android).
 */
async function measurePosition(): Promise<Measurement> {
  let best: Location.LocationObject | null = null;
  let anyMocked = false;
  for (let attempt = 0; attempt < MAX_MEASUREMENTS; attempt += 1) {
    if (attempt > 0) await sleep(REMEASURE_PAUSE_MS);
    let position: Location.LocationObject;
    try {
      position = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        LOCATION_TIMEOUT_MS,
      );
    } catch (e) {
      if (best) {
        return { best, anyMocked };
      }
      throw e;
    }
    anyMocked = anyMocked || position.mocked === true;
    if (!best || (position.coords.accuracy ?? Infinity) < (best.coords.accuracy ?? Infinity)) {
      best = position;
    }
    if ((best.coords.accuracy ?? Infinity) <= REMEASURE_THRESHOLD_M) {
      break;
    }
  }
  return { best: best!, anyMocked };
}

/** iOS „Genauer Standort" aus bzw. Android „Ungefähr": Permission erteilt, aber zu grob. */
function isApproximate(permission: Location.LocationPermissionResponse): boolean {
  return permission.ios?.accuracy === 'reduced' || permission.android?.accuracy === 'coarse';
}

type RunContext = {
  placeId: string;
  queryClient: QueryClient;
  show: (next: UnlockState) => void;
  isMounted: () => boolean;
};

/**
 * Ein Durchlauf Permission → Messung → Edge Function. Wirft nie: jeder Ausgang
 * endet in einem `UnlockState` (technische Fehler über `stateFromError`).
 */
async function runUnlock({ placeId, queryClient, show, isMounted }: RunContext): Promise<void> {
  try {
    show({ phase: 'locating' });

    // Web-Vorschau (nur Browser + EXPO_PUBLIC_PREVIEW=1): Ablauf ohne Standort und
    // ohne Netz nachspielen, damit die Prägung sichtbar wird. Native Builds
    // enthalten diesen Pfad nicht (`preview.ts` ist dort ein Stub).
    if (isPreview) {
      await sleep(900);
      show({ phase: 'submitting' });
      const { unlockedAt } = await previewUnlock(placeId);
      await queryClient.invalidateQueries({ queryKey: unlocksQueryKey });
      show({ phase: 'unlocked', unlockedAt, fresh: true });
      return;
    }
    // Ein echter Web-Build wäre ein zusätzlicher, leicht fälschbarer Kanal — Prägen nur in der App.
    if (Platform.OS === 'web') {
      show({ phase: 'error', message: de.unlock.nurApp, canRetry: false });
      return;
    }

    // 1) Permission
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      show({
        phase: 'error',
        message: de.unlock.permissionVerweigert,
        canRetry: permission.canAskAgain,
        settingsLink: !permission.canAskAgain,
      });
      return;
    }
    if (isApproximate(permission)) {
      show({ phase: 'error', message: de.unlock.ungefaehr, canRetry: true, settingsLink: true });
      return;
    }
    if (!(await Location.hasServicesEnabledAsync())) {
      show({ phase: 'error', message: de.unlock.dienstAus, canRetry: true, settingsLink: true });
      return;
    }

    // 2) Messung
    const measurement = await measurePosition().catch(() => null);
    if (!measurement) {
      show({ phase: 'error', message: de.unlock.gpsTimeout, canRetry: true });
      return;
    }
    if (!isMounted()) return; // Screen verlassen: nichts mehr absenden

    const { latitude, longitude, accuracy } = measurement.best.coords;
    if (accuracy == null) {
      show({ phase: 'error', message: de.unlock.zuUngenauOhneWert, canRetry: true });
      return;
    }

    // 3) Serverseitige Entscheidung
    show({ phase: 'submitting' });
    await ensureSession();
    const request = supabase.functions.invoke<EdgeResponse>('unlock', {
      body: { placeId, lat: latitude, lng: longitude, accuracy, isMocked: measurement.anyMocked },
    });

    // Mock-Standort (Android, A-AP6-2): Flag geht an den Server (Protokoll),
    // der Client zeigt in jedem Fall die Ablehnung.
    if (measurement.anyMocked) {
      await request.catch(() => undefined);
      show({ phase: 'error', message: de.unlock.mock, canRetry: true });
      return;
    }

    const { data, error } = await request;
    if (error || !data) {
      show(stateFromError(error));
      return;
    }
    const next = stateFromResponse(data);
    if (next.phase === 'unlocked') {
      await queryClient.invalidateQueries({ queryKey: unlocksQueryKey });
    }
    show(next);
  } catch (e) {
    show(stateFromError(e));
  }
}

/**
 * Unlock-Flow nach Projektplan §9: Permission → Messung → Edge Function.
 * Die Entscheidung fällt serverseitig; dieser Hook mappt nur die Ergebnisse
 * auf deutsche Statusmeldungen. Ein Lauf zur Zeit (Doppeltipp-Schutz); wird
 * der Screen verlassen, geht keine Anfrage mehr an den Server.
 */
export function useUnlock(placeId: string) {
  const [state, setState] = useState<UnlockState>({ phase: 'idle' });
  const queryClient = useQueryClient();
  const mounted = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Zurück aus den Einstellungen: Ist die Ursache behoben (Permission erteilt,
  // genauer Standort an, Ortungsdienste an), verschwindet der Hinweis von selbst.
  const awaitingSettings = state.phase === 'error' && state.settingsLink === true;
  useEffect(() => {
    if (!awaitingSettings) return;
    const sub = AppState.addEventListener('change', async (next) => {
      if (next !== 'active') return;
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        const ok =
          permission.status === Location.PermissionStatus.GRANTED &&
          !isApproximate(permission) &&
          (await Location.hasServicesEnabledAsync());
        if (ok && mounted.current && !inFlight.current) setState({ phase: 'idle' });
      } catch {
        // Hinweis bleibt stehen
      }
    });
    return () => sub.remove();
  }, [awaitingSettings]);

  const start = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    await runUnlock({
      placeId,
      queryClient,
      show: (next) => {
        if (mounted.current) setState(next);
      },
      isMounted: () => mounted.current,
    });
    inFlight.current = false;
  }, [placeId, queryClient]);

  return { state, start };
}
