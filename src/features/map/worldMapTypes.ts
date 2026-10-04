import type { Place } from '@/lib/places';

import type { MapRegion } from './region';

export type WorldMapHandle = {
  /** Ausschnitt animiert ansteuern. */
  focus: (region: MapRegion, durationMs?: number) => void;
};

export type WorldMapProps = {
  places: Place[];
  unlockedIds: Set<string>;
  selected: Place | null;
  initialRegion: MapRegion;
  showsUserLocation: boolean;
  onPinPress: (place: Place) => void;
  /** Platz für schwebende Leisten oben/unten, damit Fokus-Ausschnitte frei bleiben. */
  padding?: { top: number; bottom: number };
};
