import type { Place } from '@/lib/places';
import type { Region } from '@/lib/regions';

export type PlaceSection = {
  /** regions.id oder 'weitere' für Orte ohne Zuordnung (A-R2-1). */
  key: string;
  title: string | null;
  /** Name der Elternregion als Eyebrow („Baden-Württemberg" über „Ladenburg"). */
  parentTitle: string | null;
  /** null bei der Fallback-Sektion (kein Regionen-Fortschritt). */
  regionId: string | null;
  data: Place[];
};

export const FALLBACK_SECTION_KEY = 'weitere';

/**
 * Gruppiert Orte nach Unterregion (alphabetisch); Orte ohne `region_id`
 * landen in einer Fallback-Sektion am Ende. Leere Sektionen entfallen.
 */
export function buildPlaceSections(
  places: Place[],
  regions: Region[],
  fallbackTitle: string,
): PlaceSection[] {
  const regionById = new Map(regions.map((r) => [r.id, r]));
  const byRegion = new Map<string, Place[]>();
  const unassigned: Place[] = [];

  for (const place of places) {
    if (place.region_id && regionById.has(place.region_id)) {
      const list = byRegion.get(place.region_id) ?? [];
      list.push(place);
      byRegion.set(place.region_id, list);
    } else {
      unassigned.push(place);
    }
  }

  const sections: PlaceSection[] = [...byRegion.entries()]
    .map(([regionId, data]) => {
      const region = regionById.get(regionId)!;
      const parent = region.parent_id ? regionById.get(region.parent_id) : undefined;
      return {
        key: regionId,
        title: region.name,
        parentTitle: parent?.name ?? null,
        regionId,
        data,
      };
    })
    .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'de'));

  if (unassigned.length > 0) {
    sections.push({
      key: FALLBACK_SECTION_KEY,
      title: fallbackTitle,
      parentTitle: null,
      regionId: null,
      data: unassigned,
    });
  }
  return sections;
}
