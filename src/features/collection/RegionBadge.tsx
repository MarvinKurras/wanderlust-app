import { StockBadge } from '@/badges';
import { de } from '@/i18n/de';

import type { RegionProgress } from './regionProgress';

/**
 * Abschluss-Marke einer Unterregion (A-R2-2: einheitliches Siegel —
 * oval, Messing, Doppelgipfel; Band „KOMPLETT"). Solange die Region
 * nicht komplett ist, erscheint die Marke entsättigt (locked).
 */
export function RegionBadge({ progress, width = 96 }: { progress: RegionProgress; width?: number }) {
  return (
    <StockBadge
      name={progress.name}
      region={de.regionen.siegelRegion}
      elevationM={0}
      bandLabel={de.regionen.siegelBand}
      motif="twin"
      shape="oval"
      tone="brass"
      locked={!progress.complete}
      width={width}
    />
  );
}
