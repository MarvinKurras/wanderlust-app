import {
  AuthRetryableFetchError,
  FunctionsFetchError,
  FunctionsHttpError,
} from '@supabase/supabase-js';

import { de } from '@/i18n/de';

import { stateFromError, stateFromResponse } from '../unlockOutcome';

describe('stateFromResponse', () => {
  it('UNLOCKED → frische Prägung (Inszenierung)', () => {
    expect(
      stateFromResponse({ ok: true, code: 'UNLOCKED', unlockedAt: '2026-10-04T10:00:00Z' }),
    ).toEqual({
      phase: 'unlocked',
      unlockedAt: '2026-10-04T10:00:00Z',
      fresh: true,
    });
  });

  it('ALREADY_UNLOCKED → nur Status, kein erfundenes Datum', () => {
    expect(stateFromResponse({ ok: true, code: 'ALREADY_UNLOCKED' })).toEqual({
      phase: 'unlocked',
      unlockedAt: null,
      fresh: false,
    });
  });

  it('TOO_FAR nennt die Distanz', () => {
    const s = stateFromResponse({ ok: false, code: 'TOO_FAR', distanceM: 3200 });
    expect(s).toEqual({ phase: 'error', message: de.unlock.zuWeit('3,2 km'), canRetry: true });
  });

  it('ACCURACY_TOO_LOW nennt ±m nur bei plausiblem Wert', () => {
    expect(
      stateFromResponse({ ok: false, code: 'ACCURACY_TOO_LOW', accuracyM: 140 }),
    ).toMatchObject({
      message: de.unlock.zuUngenau(140),
    });
    expect(
      stateFromResponse({ ok: false, code: 'ACCURACY_TOO_LOW', accuracyM: 9999 }),
    ).toMatchObject({
      message: de.unlock.zuUngenauOhneWert,
    });
  });

  it('MOCK_LOCATION bleibt wiederholbar (Mock-App abschalten, neu versuchen)', () => {
    expect(stateFromResponse({ ok: false, code: 'MOCK_LOCATION' })).toMatchObject({
      canRetry: true,
    });
  });

  it('unbekannte Codes → generischer Fehler', () => {
    expect(stateFromResponse({ ok: false, code: 'UNKNOWN_PLACE' })).toMatchObject({
      message: de.unlock.fehler,
    });
  });
});

describe('stateFromError', () => {
  it('429 → Rast, ohne Retry', () => {
    const e = new FunctionsHttpError({ status: 429 });
    expect(stateFromError(e)).toEqual({
      phase: 'error',
      message: de.unlock.rateLimit,
      canRetry: false,
    });
  });

  it('andere HTTP-Fehler → generisch mit Retry', () => {
    expect(stateFromError(new FunctionsHttpError({ status: 500 }))).toMatchObject({
      message: de.unlock.fehler,
      canRetry: true,
    });
  });

  it('Netzwerkfehler der Function → offline', () => {
    expect(stateFromError(new FunctionsFetchError(new Error('net')))).toMatchObject({
      message: de.unlock.offline,
    });
  });

  it('Session-Erneuerung ohne Netz → ebenfalls offline (Gipfel ohne Empfang)', () => {
    expect(stateFromError(new AuthRetryableFetchError('Failed to fetch', 0))).toMatchObject({
      message: de.unlock.offline,
    });
  });
});
