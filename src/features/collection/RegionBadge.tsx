import { BadgeArt } from '@/badges';
import { de } from '@/i18n/de';

import type { RegionProgress } from './regionProgress';

/**
 * Abschluss-Marke einer Unterregion (A-R2-2: einheitliches Siegel —
 * oval, Messing, Doppelgipfel; Band „KOMPLETT"). Komplett: glänzt;
 * sonst entsättigt im Nachtnebel der Sammlung.
 */
export function RegionBadge({
  progress,
  width = 96,
}: {
  progress: RegionProgress;
  width?: number;
}) {
  return (
    <BadgeArt
      place={{
        name: progress.name,
        region: de.regionen.siegelRegion,
        elevation_m: 0,
        badge_motif: 'twin',
        badge_shape: 'oval',
        badge_tone: 'brass',
      }}
      bandLabel={de.regionen.siegelBand}
      locked={!progress.complete}
      night
      width={width}
    />
  );
}
