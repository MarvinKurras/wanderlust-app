import type { Place } from '@/lib/places';
import type { Region } from '@/lib/regions';
import type { Unlock } from '@/lib/unlocks';

/** Fortschritt einer Region oder Unterregion. */
export type RegionProgress = {
  regionId: string;
  name: string;
  parentId: string | null;
  /** Ziele direkt in dieser Region plus (bei Elternregionen) aller Unterregionen. */
  total: number;
  unlocked: number;
  /** Alle Ziele erledigt (total > 0) — Grundlage für das spätere Abschluss-Badge. */
  complete: boolean;
};

/**
 * Berechnet den Fortschritt je Region aus den ohnehin geladenen Daten
 * (clientseitig, offline-fähig über den Query-Cache). Elternregionen
 * erhalten ein Roll-up über alle direkten und indirekten Unterregionen.
 */
export function regionProgress(
  regions: Region[],
  places: Place[],
  unlocks: Unlock[],
): Map<string, RegionProgress> {
  const unlockedIds = new Set(unlocks.map((u) => u.place_id));

  // Direkte Zählung pro Region
  const result = new Map<string, RegionProgress>();
  for (const region of regions) {
    result.set(region.id, {
      regionId: region.id,
      name: region.name,
      parentId: region.parent_id,
      total: 0,
      unlocked: 0,
      complete: false,
    });
  }
  const direct = new Map<string, { total: number; unlocked: number }>();
  for (const place of places) {
    if (!place.region_id || !result.has(place.region_id)) continue;
    const d = direct.get(place.region_id) ?? { total: 0, unlocked: 0 };
    d.total += 1;
    if (unlockedIds.has(place.id)) {
      d.unlocked += 1;
    }
    direct.set(place.region_id, d);
  }

  // Direktzähler jeder Region auf sie selbst und alle Vorfahren addieren
  // (beliebige Tiefe, zyklensicher; verhindert Doppelzählung beim Roll-up)
  for (const region of regions) {
    const d = direct.get(region.id);
    if (!d) continue;
    let currentId: string | null = region.id;
    const seen = new Set<string>();
    while (currentId && !seen.has(currentId)) {
      seen.add(currentId);
      const entry = result.get(currentId);
      if (!entry) break;
      entry.total += d.total;
      entry.unlocked += d.unlocked;
      currentId = entry.parentId;
    }
  }

  for (const entry of result.values()) {
    entry.complete = entry.total > 0 && entry.unlocked === entry.total;
  }
  return result;
}

/** „3 von 8 Zielen in Ladenburg erledigt" */
export function regionProgressLabel(p: RegionProgress): string {
  const ziel = p.total === 1 ? 'Ziel' : 'Zielen';
  return `${p.unlocked} von ${p.total} ${ziel} in ${p.name} erledigt`;
}
