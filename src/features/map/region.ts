import type { Region } from 'react-native-maps';

import type { Place } from '@/lib/places';

/** Fallback: Deutschland-Gesamtansicht (wie die Website-Karte). */
export const GERMANY_REGION: Region = {
  latitude: 51.1,
  longitude: 10.4,
  latitudeDelta: 9.5,
  longitudeDelta: 9.5,
};

/** Region, die alle Orte mit etwas Rand einschließt. */
export function regionForPlaces(places: Place[]): Region {
  if (places.length === 0) {
    return GERMANY_REGION;
  }
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padding = 1.25; // Rand, damit Pins nicht am Kartenrand kleben
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * padding, 0.5),
    longitudeDelta: Math.max((maxLng - minLng) * padding, 0.5),
  };
}

/** Ausschnitt beim Fokussieren eines Ortes (Chip-Tap / Pin-Tap). */
export function regionForPlace(place: Place): Region {
  return {
    latitude: place.lat,
    longitude: place.lng,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
  };
}
