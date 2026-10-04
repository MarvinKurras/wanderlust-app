import type { MapRegion } from './region';

/**
 * Einfache Karten-Projektion für die Web-Vorschau (AP-D): plattkartenartig mit
 * Breitenkorrektur am Ausschnittszentrum. Wie bei MapView passt der Ausschnitt
 * vollständig in den Viewport; die freie Achse wird aufgezogen.
 */
export type Viewport = { width: number; height: number };

export type Projection = {
  /** Pixel pro Längengrad */
  scale: number;
  /** cos(Breite des Zentrums) */
  cosLat: number;
  center: { lat: number; lng: number };
};

export function makeProjection(region: MapRegion, viewport: Viewport): Projection {
  const cosLat = Math.cos((region.latitude * Math.PI) / 180);
  const scale = Math.min(
    viewport.width / region.longitudeDelta,
    (viewport.height * cosLat) / region.latitudeDelta,
  );
  return { scale, cosLat, center: { lat: region.latitude, lng: region.longitude } };
}

export function project(
  lat: number,
  lng: number,
  projection: Projection,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: viewport.width / 2 + (lng - projection.center.lng) * projection.scale,
    y: viewport.height / 2 - ((lat - projection.center.lat) * projection.scale) / projection.cosLat,
  };
}

/** Radius in Metern → Pixel (über Breitengrade, 111,32 km/°). */
export function metersToPixels(meters: number, projection: Projection): number {
  return ((meters / 111320) * projection.scale) / projection.cosLat;
}

/** Schrittweite des Gradnetzes passend zum Ausschnitt (Grad). */
export function graticuleStep(longitudeDelta: number): number {
  if (longitudeDelta > 6) return 2;
  if (longitudeDelta > 2) return 1;
  if (longitudeDelta > 0.5) return 0.25;
  if (longitudeDelta > 0.1) return 0.05;
  return 0.01;
}
