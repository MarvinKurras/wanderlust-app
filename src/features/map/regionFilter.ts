import type { Place } from '@/lib/places';
import type { Region } from '@/lib/regions';

/** Pseudo-Filter neben echten Regionen-IDs. */
export const ALL_FILTER_KEY = 'alle';
export const UNASSIGNED_FILTER_KEY = 'weitere';

export type RegionFilterOption = {
  /** regions.id oder ALL_FILTER_KEY / UNASSIGNED_FILTER_KEY. */
  key: string;
  title: string;
  /** 0 = Wurzelregion, 1 = Unterregion usw.; 0 für die Pseudo-Filter. */
  depth: number;
  /** Ziele in der Region inkl. aller Unterregionen (Roll-up). */
  placeCount: number;
};

/** Eine Region samt aller (rekursiven) Unterregionen, zyklensicher. */
export function regionWithDescendants(regionId: string, regions: Region[]): Set<string> {
  const children = new Map<string | null, string[]>();
  for (const r of regions) {
    const list = children.get(r.parent_id) ?? [];
    list.push(r.id);
    children.set(r.parent_id, list);
  }
  const result = new Set<string>();
  const queue = [regionId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (result.has(id)) continue;
    result.add(id);
    queue.push(...(children.get(id) ?? []));
  }
  return result;
}

/** Orte zum gewählten Filter (Region inkl. Unterregionen, „weitere" = ohne Zuordnung). */
export function placesForFilter(key: string, places: Place[], regions: Region[]): Place[] {
  if (key === ALL_FILTER_KEY) {
    return places;
  }
  if (key === UNASSIGNED_FILTER_KEY) {
    const known = new Set(regions.map((r) => r.id));
    return places.filter((p) => !p.region_id || !known.has(p.region_id));
  }
  const ids = regionWithDescendants(key, regions);
  return places.filter((p) => p.region_id != null && ids.has(p.region_id));
}

/**
 * Filter-Optionen für die Karten-Leiste: „Alle" zuerst, dann Regionen mit
 * Zielen (Tiefensuche ab den Wurzeln, Eltern vor Kindern, alphabetisch),
 * zuletzt „Weitere Ziele", falls es Orte ohne Zuordnung gibt.
 */
export function buildRegionFilters(
  places: Place[],
  regions: Region[],
  allTitle: string,
  unassignedTitle: string,
): RegionFilterOption[] {
  const options: RegionFilterOption[] = [
    { key: ALL_FILTER_KEY, title: allTitle, depth: 0, placeCount: places.length },
  ];

  const byParent = new Map<string | null, Region[]>();
  for (const r of regions) {
    const list = byParent.get(r.parent_id) ?? [];
    list.push(r);
    byParent.set(r.parent_id, list);
  }
  const visit = (parentId: string | null, depth: number, seen: Set<string>) => {
    const children = (byParent.get(parentId) ?? [])
      .filter((r) => !seen.has(r.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
    for (const region of children) {
      seen.add(region.id);
      const count = placesForFilter(region.id, places, regions).length;
      if (count > 0) {
        options.push({ key: region.id, title: region.name, depth, placeCount: count });
      }
      visit(region.id, depth + 1, seen);
    }
  };
  visit(null, 0, new Set());

  const unassigned = placesForFilter(UNASSIGNED_FILTER_KEY, places, regions);
  if (unassigned.length > 0) {
    options.push({
      key: UNASSIGNED_FILTER_KEY,
      title: unassignedTitle,
      depth: 0,
      placeCount: unassigned.length,
    });
  }
  return options;
}
