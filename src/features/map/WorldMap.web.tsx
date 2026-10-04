import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { de } from '@/i18n/de';
import { colors, fonts, mapPaint } from '@/theme';

import { PlacePin } from './PlacePin';
import { graticuleStep, makeProjection, metersToPixels, project } from './projection';
import type { WorldMapHandle, WorldMapProps } from './worldMapTypes';

export type { WorldMapHandle, WorldMapProps } from './worldMapTypes';

/**
 * Web-Vorschau der Karte (AP-D): react-native-maps hat kein Web. Gezeichnet
 * wird ein Pergament-Gradnetz in den Farben der gemalten Website-Karte, darauf
 * die echten Pins und die Präge-Zone. Nur für Vorschau-Builds gedacht.
 */
export const WorldMap = forwardRef<WorldMapHandle, WorldMapProps>(function WorldMap(
  { places, unlockedIds, selected, initialRegion, onPinPress },
  ref,
) {
  const [region, setRegion] = useState(initialRegion);
  const [viewport, setViewport] = useState({ width: 1, height: 1 });

  useImperativeHandle(ref, () => ({ focus: (next) => setRegion(next) }));

  const projection = useMemo(() => makeProjection(region, viewport), [region, viewport]);

  const lines = useMemo(() => {
    const step = graticuleStep(region.longitudeDelta);
    const spanLng = viewport.width / projection.scale;
    const spanLat = (viewport.height * projection.cosLat) / projection.scale;
    const result: {
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      label: string;
      vertical: boolean;
    }[] = [];
    const lngStart = Math.floor((region.longitude - spanLng) / step) * step;
    for (let lng = lngStart; lng <= region.longitude + spanLng; lng += step) {
      const { x } = project(region.latitude, lng, projection, viewport);
      result.push({
        key: `v${lng.toFixed(3)}`,
        x1: x,
        y1: 0,
        x2: x,
        y2: viewport.height,
        label: `${lng.toFixed(2)}°O`,
        vertical: true,
      });
    }
    const latStart = Math.floor((region.latitude - spanLat) / step) * step;
    for (let lat = latStart; lat <= region.latitude + spanLat; lat += step) {
      const { y } = project(lat, region.longitude, projection, viewport);
      result.push({
        key: `h${lat.toFixed(3)}`,
        x1: 0,
        y1: y,
        x2: viewport.width,
        y2: y,
        label: `${lat.toFixed(2)}°N`,
        vertical: false,
      });
    }
    return result;
  }, [region, viewport, projection]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport({ width: Math.max(1, width), height: Math.max(1, height) });
  };

  const zone = selected
    ? {
        ...project(selected.lat, selected.lng, projection, viewport),
        r: metersToPixels(selected.unlock_radius_m, projection),
      }
    : null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.paper]} onLayout={onLayout}>
      <Svg style={StyleSheet.absoluteFill} width={viewport.width} height={viewport.height}>
        {lines.map((l) => (
          <Line
            key={l.key}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={mapPaint.graticule}
            strokeWidth={1}
            strokeDasharray={[2, 5]}
            opacity={0.7}
          />
        ))}
        {zone && (
          <Circle
            cx={zone.x}
            cy={zone.y}
            r={Math.max(zone.r, 6)}
            fill={colors.brassVeil}
            stroke={colors.brassDeep}
            strokeWidth={1.5}
            strokeDasharray={[6, 5]}
          />
        )}
      </Svg>
      {places.map((place) => {
        const { x, y } = project(place.lat, place.lng, projection, viewport);
        return (
          <Pressable
            key={place.id}
            onPress={() => onPinPress(place)}
            accessibilityRole="button"
            accessibilityLabel={de.karte.karussellZiel(place.name)}
            style={[styles.pin, { left: x, top: y }]}
          >
            <View style={styles.pinInner}>
              <PlacePin place={place} unlocked={unlockedIds.has(place.id)} />
            </View>
          </Pressable>
        );
      })}
      <Text style={styles.note}>{de.vorschau.kartenhinweis}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  paper: {
    backgroundColor: mapPaint.land,
    overflow: 'hidden',
  },
  pin: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  pinInner: {
    position: 'absolute',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
  },
  note: {
    position: 'absolute',
    left: 12,
    bottom: 230,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: mapPaint.label,
    opacity: 0.55,
  },
});
