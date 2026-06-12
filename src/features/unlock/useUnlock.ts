import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import { unlocksQueryKey } from '@/features/places/queries';
import { de } from '@/i18n/de';
import { ensureSession } from '@/lib/auth';
import { formatDistance } from '@/lib/geo';
import { supabase } from '@/lib/supabase';

const LOCATION_TIMEOUT_MS = 15_000;
const REMEASURE_THRESHOLD_M = 50; // §9: bei accuracy > 50 m bis zu 2× nachmessen
const MAX_MEASUREMENTS = 3;

export type UnlockState =
  | { phase: 'idle' }
  | { phase: 'locating' }
  | { phase: 'submitting' }
  | { phase: 'unlocked'; unlockedAt: string }
  | { phase: 'error'; message: string; canRetry: boolean; settingsLink?: boolean };

type EdgeResponse = {
  ok: boolean;
  code: string;
  distanceM?: number;
  accuracyM?: number;
  unlockedAt?: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * Beste Messung: misst bis zu 3×, bricht ab sobald accuracy ≤ 50 m (§9).
 * Ein Timeout einzelner Nachmessungen verwirft eine bereits vorhandene
 * (ungenauere) Messung nicht — nur ohne jede Messung wird geworfen.
 */
async function measurePosition(): Promise<Location.LocationObject> {
  let best: Location.LocationObject | null = null;
  for (let attempt = 0; attempt < MAX_MEASUREMENTS; attempt += 1) {
    let position: Location.LocationObject;
    try {
      position = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        LOCATION_TIMEOUT_MS,
      );
    } catch (e) {
      if (best) {
        return best;
      }
      throw e;
    }
    if (!best || (position.coords.accuracy ?? Infinity) < (best.coords.accuracy ?? Infinity)) {
      best = position;
    }
    if ((best.coords.accuracy ?? Infinity) <= REMEASURE_THRESHOLD_M) {
      break;
    }
  }
  return best!;
}

/**
 * Unlock-Flow nach Projektplan §9: Permission → Messung → Edge Function.
 * Die Entscheidung fällt serverseitig; dieser Hook mappt nur die Ergebnisse
 * auf deutsche Statusmeldungen.
 */
export function useUnlock(placeId: string) {
  const [state, setState] = useState<UnlockState>({ phase: 'idle' });
  const queryClient = useQueryClient();

  const start = useCallback(async () => {
    // 1) Permission
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setState({
        phase: 'error',
        message: de.unlock.permissionVerweigert,
        canRetry: permission.canAskAgain,
        settingsLink: !permission.canAskAgain,
      });
      return;
    }

    // 2) Messung
    setState({ phase: 'locating' });
    let position: Location.LocationObject;
    try {
      position = await measurePosition();
    } catch {
      setState({ phase: 'error', message: de.unlock.gpsTimeout, canRetry: true });
      return;
    }

    const { latitude, longitude, accuracy } = position.coords;
    const accuracyM = accuracy ?? 9999;
    // Mock-Location clientseitig blockieren (Android; A-AP6-2) — der Server prüft das Flag zusätzlich
    const mocked = position.mocked === true;
    if (mocked) {
      setState({ phase: 'error', message: de.unlock.mock, canRetry: false });
      return;
    }

    // 3) Serverseitige Entscheidung
    setState({ phase: 'submitting' });
    try {
      await ensureSession();
      const { data, error } = await supabase.functions.invoke<EdgeResponse>('unlock', {
        body: {
          placeId,
          lat: latitude,
          lng: longitude,
          accuracy: accuracyM,
          isMocked: mocked,
        },
      });
      if (error || !data) {
        throw error ?? new Error('empty response');
      }

      switch (data.code) {
        case 'UNLOCKED':
        case 'ALREADY_UNLOCKED':
          await queryClient.invalidateQueries({ queryKey: unlocksQueryKey });
          setState({ phase: 'unlocked', unlockedAt: data.unlockedAt ?? new Date().toISOString() });
          return;
        case 'TOO_FAR':
          setState({
            phase: 'error',
            message: de.unlock.zuWeit(formatDistance(data.distanceM ?? 0)),
            canRetry: true,
          });
          return;
        case 'ACCURACY_TOO_LOW':
          setState({
            phase: 'error',
            message: de.unlock.zuUngenau(data.accuracyM ?? Math.round(accuracyM)),
            canRetry: true,
          });
          return;
        case 'MOCK_LOCATION':
          setState({ phase: 'error', message: de.unlock.mock, canRetry: false });
          return;
        default:
          setState({ phase: 'error', message: de.unlock.fehler, canRetry: true });
          return;
      }
    } catch (e) {
      // AP9: Fehler differenzieren — nur echte Netzwerkfehler sind „offline" (§9)
      if (e instanceof FunctionsHttpError) {
        const status = e.context?.status;
        setState({
          phase: 'error',
          message: status === 429 ? de.unlock.rateLimit : de.unlock.fehler,
          canRetry: status !== 429,
        });
        return;
      }
      if (e instanceof FunctionsFetchError) {
        setState({ phase: 'error', message: de.unlock.offline, canRetry: true });
        return;
      }
      setState({ phase: 'error', message: de.unlock.fehler, canRetry: true });
    }
  }, [placeId, queryClient]);

  return { state, start };
}
