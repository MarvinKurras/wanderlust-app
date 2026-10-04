import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { androidMapStyle, colors } from '@/theme';

import { PlacePin } from './PlacePin';
import type { WorldMapHandle, WorldMapProps } from './worldMapTypes';

export type { WorldMapHandle, WorldMapProps } from './worldMapTypes';

/**
 * Standardkarte (verbindliche MVP-Entscheidung) im Pergament-Stil (A-D-3):
 * iOS `mutedStandard`, Android Google-Maps-Stil aus `theme/mapStyle`.
 * Pins bleiben statisch (A-D-4); die Präge-Zone zeigt den Freischalt-Radius.
 */
export const WorldMap = forwardRef<WorldMapHandle, WorldMapProps>(function WorldMap(
  { places, unlockedIds, selected, initialRegion, showsUserLocation, onPinPress, padding },
  ref,
) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    focus: (region, durationMs = 650) => mapRef.current?.animateToRegion(region, durationMs),
  }));

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
      customMapStyle={Platform.OS === 'android' ? androidMapStyle : undefined}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterests={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      mapPadding={
        padding ? { top: padding.top, bottom: padding.bottom, left: 0, right: 0 } : undefined
      }
    >
      {places.map((place) => (
        <Marker
          key={place.id}
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          onPress={() => onPinPress(place)}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <PlacePin place={place} unlocked={unlockedIds.has(place.id)} />
        </Marker>
      ))}
      {/* Präge-Zone des fokussierten Ortes: so weit muss man heran (AP-R3) */}
      {selected && (
        <Circle
          center={{ latitude: selected.lat, longitude: selected.lng }}
          radius={selected.unlock_radius_m}
          strokeColor={colors.brassDeep}
          strokeWidth={1.5}
          fillColor={colors.brassVeil}
          lineDashPattern={[6, 5]}
        />
      )}
    </MapView>
  );
});
