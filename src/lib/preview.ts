import type { Place } from './places';
import type { Region } from './regions';
import type { Unlock } from './unlocks';

/**
 * Web-Vorschau (AP-D) — native Fassung: Auf iOS/Android ist der Vorschau-Modus
 * physisch nicht vorhanden. Die echte Implementierung samt Seed-Kopien liegt in
 * `preview.web.ts` und landet nur im Web-Bundle; hier bleiben Stubs, die nie
 * aufgerufen werden (alle Aufrufer prüfen `isPreview`).
 */
export const isPreview: boolean = false;

function unavailable(): never {
  throw new Error('Vorschau-Modus ist nur in der Web-Vorschau verfügbar.');
}

export async function previewFetchPlaces(): Promise<Place[]> {
  return unavailable();
}

export async function previewFetchRegions(): Promise<Region[]> {
  return unavailable();
}

export async function previewFetchUnlocks(): Promise<Unlock[]> {
  return unavailable();
}

export async function previewUnlock(_placeId: string): Promise<{ unlockedAt: string }> {
  return unavailable();
}
