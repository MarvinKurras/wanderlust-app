import Feather from '@expo/vector-icons/Feather';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceCarousel } from '@/features/map/PlaceCarousel';
import { PlacePin } from '@/features/map/PlacePin';
import { PlaceSheet } from '@/features/map/PlaceSheet';
import { regionForPlace, regionForPlaces } from '@/features/map/region';
import {
  ALL_FILTER_KEY,
  buildRegionFilters,
  placesForFilter,
  type RegionFilterOption,
} from '@/features/map/regionFilter';
import { RegionRail } from '@/features/map/RegionRail';
import { usePlaces, useRegions, useUnlocks } from '@/features/places/queries';
import { de } from '@/i18n/de';
import { haversineM } from '@/lib/geo';
import type { Place } from '@/lib/places';
import { colors, spacing, textStyles } from '@/theme';

type Coords = { lat: number; lng: number };

export default function KarteScreen() {
  const insets = useSafeAreaInsets();
  const places = usePlaces();
  const regions = useRegions();
  const unlocks = useUnlocks();
  const mapRef = useRef<MapView>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [filterKey, setFilterKey] = useState<string>(ALL_FILTER_KEY);

  const unlockedIds = useMemo(
    () => new Set((unlocks.data ?? []).map((u) => u.place_id)),
    [unlocks.data],
  );
  const filterOptions = useMemo(
    () =>
      buildRegionFilters(
        places.data ?? [],
        regions.data ?? [],
        de.karte.regionAlle,
        de.regionen.weitereZiele,
      ),
    [places.data, regions.data],
  );
  const visiblePlaces = useMemo(
    () => placesForFilter(filterKey, places.data ?? [], regions.data ?? []),
    [filterKey, places.data, regions.data],
  );
  const distancesM = useMemo(() => {
    if (!coords) return null;
    return new Map(
      visiblePlaces.map((p) => [p.id, haversineM(coords.lat, coords.lng, p.lat, p.lng)]),
    );
  }, [coords, visiblePlaces]);
  const initialRegion = useMemo(() => regionForPlaces(places.data ?? []), [places.data]);

  // Einmaliger Positions-Read NUR für die Distanzanzeige — Foreground, kein Abo,
  // bewusst Accuracy.Balanced. Die Unlock-Messung (Accuracy.High, §9) bleibt
  // ausschließlich in useUnlock.ts; hier fällt keine Freischalt-Entscheidung.
  const readPosition = async (): Promise<Coords | null> => {
    try {
      const position =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      if (!position) return null;
      const next = { lat: position.coords.latitude, lng: position.coords.longitude };
      setCoords(next);
      return next;
    } catch {
      return null;
    }
  };

  // Bereits erteilte Permission beim Öffnen nutzen (A-R3-2) — kein neuer Prompt.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED && !cancelled) {
        setShowLocation(true);
        void readPosition();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const focusPlace = (place: Place, openSheet: boolean) => {
    setSelected(place);
    mapRef.current?.animateToRegion(regionForPlace(place), 600);
    if (openSheet) {
      setSheetOpen(true);
    }
  };

  const selectRegion = (option: RegionFilterOption) => {
    setFilterKey(option.key);
    setSelected(null);
    setSheetOpen(false);
    const target = placesForFilter(option.key, places.data ?? [], regions.data ?? []);
    mapRef.current?.animateToRegion(regionForPlaces(target), 700);
  };

  // Eigener Standort on demand (A-AP5-3): Permission erst beim Tap anfragen.
  // Verweigert → bewusst stiller Ausstieg (A-R3-5); der volle Hinweis-Flow mit
  // Settings-Link gehört zum Unlock (§9), nicht zur Kartenanzeige.
  const locate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) return;
    setShowLocation(true);
    const here = await readPosition();
    if (here) {
      mapRef.current?.animateToRegion(
        { latitude: here.lat, longitude: here.lng, latitudeDelta: 0.04, longitudeDelta: 0.04 },
        600,
      );
    }
  };

  if (places.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brassDeep} />
        <Text style={[textStyles.body, styles.loading]}>{de.karte.laden}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={showLocation}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {visiblePlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => focusPlace(place, true)}
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
          />
        )}
      </MapView>

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
        <RegionRail options={filterOptions} selectedKey={filterKey} onSelect={selectRegion} />
      </View>

      <Pressable
        onPress={locate}
        accessibilityRole="button"
        accessibilityLabel={de.karte.locateLabel}
        style={[styles.locate, { top: insets.top + spacing.sm + 48 }]}
      >
        <Feather name="crosshair" size={18} color={colors.ink} />
      </Pressable>

      <View style={styles.bottomBar} pointerEvents="box-none">
        <PlaceCarousel
          places={visiblePlaces}
          unlockedIds={unlockedIds}
          selectedId={selected?.id ?? null}
          distancesM={distancesM}
          onFocus={(place) => focusPlace(place, false)}
          onOpen={(place) => focusPlace(place, true)}
        />
      </View>

      {sheetOpen && selected && (
        <PlaceSheet
          place={selected}
          unlock={unlocks.data?.find((u) => u.place_id === selected.id)}
          distanceM={distancesM?.get(selected.id) ?? null}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  loading: {
    marginTop: spacing.md,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.md,
  },
  locate: {
    position: 'absolute',
    right: spacing.md,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.paperLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
