import {
  FunctionsFetchError,
  FunctionsHttpError,
  isAuthRetryableFetchError,
} from '@supabase/supabase-js';

import { de } from '@/i18n/de';
import { formatDistance } from '@/lib/geo';

/**
 * Zustände des Unlock-Flows (§9). `unlocked` entsteht ausschließlich aus einer
 * Server-Antwort; `fresh` unterscheidet eine neue Prägung (Inszenierung) von
 * einem bereits vorhandenen Unlock (nur Status).
 */
export type UnlockState =
  | { phase: 'idle' }
  | { phase: 'locating' }
  | { phase: 'submitting' }
  | { phase: 'unlocked'; unlockedAt: string | null; fresh: boolean }
  | { phase: 'error'; message: string; canRetry: boolean; settingsLink?: boolean };

export type EdgeResponse = {
  ok: boolean;
  code: string;
  distanceM?: number;
  accuracyM?: number;
  unlockedAt?: string;
};

/** Business-Antwort der Edge Function `unlock` → UI-Zustand. */
export function stateFromResponse(data: EdgeResponse): UnlockState {
  switch (data.code) {
    case 'UNLOCKED':
      return { phase: 'unlocked', unlockedAt: data.unlockedAt ?? null, fresh: true };
    case 'ALREADY_UNLOCKED':
      return { phase: 'unlocked', unlockedAt: data.unlockedAt ?? null, fresh: false };
    case 'TOO_FAR':
      return {
        phase: 'error',
        message: de.unlock.zuWeit(formatDistance(data.distanceM ?? 0)),
        canRetry: true,
      };
    case 'ACCURACY_TOO_LOW':
      return {
        phase: 'error',
        message:
          data.accuracyM != null && data.accuracyM < 5000
            ? de.unlock.zuUngenau(data.accuracyM)
            : de.unlock.zuUngenauOhneWert,
        canRetry: true,
      };
    case 'MOCK_LOCATION':
      return { phase: 'error', message: de.unlock.mock, canRetry: true };
    default:
      return { phase: 'error', message: de.unlock.fehler, canRetry: true };
  }
}

/**
 * Technische Fehler → UI-Zustand. Nur echte Netzwerkfehler gelten als „offline"
 * (§9) — auch dann, wenn schon die Session-Erneuerung am fehlenden Netz scheitert.
 */
export function stateFromError(e: unknown): UnlockState {
  if (e instanceof FunctionsHttpError) {
    const status = (e.context as { status?: number } | undefined)?.status;
    return {
      phase: 'error',
      message: status === 429 ? de.unlock.rateLimit : de.unlock.fehler,
      canRetry: status !== 429,
    };
  }
  if (e instanceof FunctionsFetchError || isAuthRetryableFetchError(e)) {
    return { phase: 'error', message: de.unlock.offline, canRetry: true };
  }
  return { phase: 'error', message: de.unlock.fehler, canRetry: true };
}
