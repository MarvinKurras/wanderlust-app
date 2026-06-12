import type { Region } from 'react-native-maps';

import type { Place } from '@/lib/places';

/** Fallback: Deutschland-Gesamtansicht (wie die Website-Karte). */
export const GERMANY_REGION: Region = {
  latitude: 51.1,
  longitude: 10.4,
  latitudeDelta: 9.5,
  longitudeDelta: 9.5,
};

/**
 * Region, die alle Orte mit etwas Rand einschließt. Das Minimum von 0,02°
 * (~2 km) hält dichte Stadt-Unterregionen wie Ladenburg auf Stadt-Niveau,
 * statt auf einen halben Landesausschnitt aufzuziehen.
 */
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
  const padding = 1.4; // Rand, damit Pins nicht am Kartenrand kleben
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * padding, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * padding, 0.02),
  };
}

/**
 * Ausschnitt beim Fokussieren eines Ortes (Karussell-/Pin-Tap).
 * Skaliert mit dem Freischalt-Radius (A-R3-3): Stadthotspot 150 m ≈ 2 km
 * Ausschnitt, Gipfel 500 m ≈ 8 km — geklemmt auf 0,012–0,08°.
 */
export function regionForPlace(place: Place): Region {
  const metersPerDegreeLat = 111320;
  const latDelta = Math.min(
    Math.max((place.unlock_radius_m * 14) / metersPerDegreeLat, 0.012),
    0.08,
  );
  // Längengrade werden zum Pol hin kürzer — cos(lat) hält den Ausschnitt
  // in Ost-West-Richtung metrisch gleich breit wie in Nord-Süd-Richtung.
  const lngDelta = latDelta / Math.cos((place.lat * Math.PI) / 180);
  return {
    latitude: place.lat,
    longitude: place.lng,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
