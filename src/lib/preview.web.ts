import { Platform } from 'react-native';

import type { Place } from './places';
import { previewPlaces, previewRegions, previewUnlocks } from './previewData';
import type { Region } from './regions';
import type { Unlock } from './unlocks';

/**
 * Web-Vorschau mit lokalen Daten (AP-D). Diese Datei wird nur ins Web-Bundle
 * aufgenommen (native Fassung: `preview.ts`, immer aus) und gilt auch dort nur,
 * wenn der Build mit `EXPO_PUBLIC_PREVIEW=1` erzeugt wurde. Echte Freischaltungen
 * entscheidet weiterhin allein die Edge Function `unlock`.
 */
export const isPreview = Platform.OS === 'web' && process.env.EXPO_PUBLIC_PREVIEW === '1';

function assertPreview(): void {
  if (!isPreview) {
    throw new Error('Vorschau-Daten nur mit EXPO_PUBLIC_PREVIEW=1.');
  }
}

// Vorschau-Zustand lebt nur im Speicher des Browser-Tabs.
const unlocks: Unlock[] = [...previewUnlocks];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function previewFetchPlaces(): Promise<Place[]> {
  assertPreview();
  await wait(250);
  return [...previewPlaces].sort((a, b) => b.elevation_m - a.elevation_m);
}

export async function previewFetchRegions(): Promise<Region[]> {
  assertPreview();
  return [...previewRegions].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export async function previewFetchUnlocks(): Promise<Unlock[]> {
  assertPreview();
  return [...unlocks];
}

/** Spielt den Präge-Ablauf ohne Netz nach, damit die Inszenierung sichtbar wird. */
export async function previewUnlock(placeId: string): Promise<{ unlockedAt: string }> {
  assertPreview();
  await wait(900);
  const existing = unlocks.find((u) => u.place_id === placeId);
  if (existing) {
    return { unlockedAt: existing.unlocked_at };
  }
  const unlockedAt = new Date().toISOString();
  unlocks.push({ place_id: placeId, unlocked_at: unlockedAt });
  return { unlockedAt };
}
