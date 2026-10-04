import { Platform } from 'react-native';

import type { Place } from './places';
import { previewPlaces, previewRegions, previewUnlocks } from './previewData';
import type { Region } from './regions';
import type { Unlock } from './unlocks';

/**
 * Web-Vorschau mit lokalen Daten (AP-D). Gilt ausschließlich im Browser und nur,
 * wenn der Build mit `EXPO_PUBLIC_PREVIEW=1` erzeugt wurde. Native Builds (iOS,
 * Android) erreichen keinen dieser Pfade — dort entscheidet weiterhin allein die
 * Edge Function `unlock` über Freischaltungen.
 */
export const isPreview = Platform.OS === 'web' && process.env.EXPO_PUBLIC_PREVIEW === '1';

// Vorschau-Zustand lebt nur im Speicher des Browser-Tabs.
const unlocks: Unlock[] = [...previewUnlocks];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function previewFetchPlaces(): Promise<Place[]> {
  await wait(250);
  return [...previewPlaces].sort((a, b) => b.elevation_m - a.elevation_m);
}

export async function previewFetchRegions(): Promise<Region[]> {
  return [...previewRegions].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export async function previewFetchUnlocks(): Promise<Unlock[]> {
  return [...unlocks];
}

/** Spielt den Präge-Ablauf ohne Netz nach, damit die Inszenierung sichtbar wird. */
export async function previewUnlock(placeId: string): Promise<{ unlockedAt: string }> {
  await wait(900);
  const existing = unlocks.find((u) => u.place_id === placeId);
  if (existing) {
    return { unlockedAt: existing.unlocked_at };
  }
  const unlockedAt = new Date().toISOString();
  unlocks.push({ place_id: placeId, unlocked_at: unlockedAt });
  return { unlockedAt };
}
