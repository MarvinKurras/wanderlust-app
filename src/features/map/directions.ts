import { Linking, Platform } from 'react-native';

import type { Place } from '@/lib/places';

/**
 * URL für Fußweg-Navigation in der System-Karten-App (kein eigenes Routing
 * im MVP): Apple Maps auf iOS, Google-Maps-Intent sonst.
 */
export function directionsUrl(lat: number, lng: number, platform: string = Platform.OS): string {
  if (platform === 'ios') {
    return `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}&travelmode=walking`;
}

/** Öffnet die Fußweg-Route zum Ort in der System-Karten-App. */
export function openDirections(place: Place): Promise<unknown> {
  return Linking.openURL(directionsUrl(place.lat, place.lng));
}
