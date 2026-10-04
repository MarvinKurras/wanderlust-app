import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Atmosphere } from '@/components/atmosphere/Atmosphere';
import { IconButton } from '@/components/IconButton';
import { StateView } from '@/components/StateView';
import { useTabBarSpace } from '@/components/TabBar';
import { PlaceCarousel } from '@/features/map/PlaceCarousel';
import { PlaceSheet } from '@/features/map/PlaceSheet';
import { regionForPlace, regionForPlaces } from '@/features/map/region';
import {
  ALL_FILTER_KEY,
  buildRegionFilters,
  placesForFilter,
  type RegionFilterOption,
} from '@/features/map/regionFilter';
import { RegionRail } from '@/features/map/RegionRail';
import { WorldMap, type WorldMapHandle } from '@/features/map/WorldMap';
import { usePlaces, useRegions, useUnlocks } from '@/features/places/queries';
import { de } from '@/i18n/de';
import { haversineM } from '@/lib/geo';
import type { Place } from '@/lib/places';
import { spacing } from '@/theme';

type Coords = { lat: number; lng: number };

/** Höhe des Karussells inkl. Innenabstand — Platz, den die Karte unten frei hält. */
const CAROUSEL_H = 104;

export default function KarteScreen() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const places = usePlaces();
  const regions = useRegions();
  const unlocks = useUnlocks();
  const mapRef = useRef<WorldMapHandle>(null);
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
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === Location.PermissionStatus.GRANTED && !cancelled) {
          setShowLocation(true);
          void readPosition();
        }
      } catch {
        // ohne Standortdienst bleibt die Karte einfach ohne Distanzen
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const focusPlace = (place: Place, openSheet: boolean) => {
    setSelected(place);
    mapRef.current?.focus(regionForPlace(place), 650);
    if (openSheet) {
      setSheetOpen(true);
    }
  };

  const selectRegion = (option: RegionFilterOption) => {
    setFilterKey(option.key);
    setSelected(null);
    setSheetOpen(false);
    const target = placesForFilter(option.key, places.data ?? [], regions.data ?? []);
    mapRef.current?.focus(regionForPlaces(target), 750);
  };

  // Eigener Standort on demand (A-AP5-3): Permission erst beim Tap anfragen.
  // Verweigert → bewusst stiller Ausstieg (A-R3-5); der volle Hinweis-Flow mit
  // Settings-Link gehört zum Unlock (§9), nicht zur Kartenanzeige.
  const locate = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) return;
    } catch {
      return;
    }
    setShowLocation(true);
    const here = await readPosition();
    if (here) {
      mapRef.current?.focus(
        { latitude: here.lat, longitude: here.lng, latitudeDelta: 0.04, longitudeDelta: 0.04 },
        650,
      );
    }
  };

  if (places.isPending) {
    return (
      <View style={styles.center}>
        <Atmosphere variant="paper" />
        <StateView loading message={de.karte.laden} />
      </View>
    );
  }

  const topBar = insets.top + spacing.sm;

  return (
    <View style={styles.screen}>
      <WorldMap
        ref={mapRef}
        places={visiblePlaces}
        unlockedIds={unlockedIds}
        selected={selected}
        initialRegion={initialRegion}
        showsUserLocation={showLocation}
        onPinPress={(place) => focusPlace(place, true)}
        padding={{ top: topBar + 52, bottom: tabSpace + CAROUSEL_H }}
      />

      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        style={[styles.topBar, { top: topBar }]}
        pointerEvents="box-none"
      >
        <RegionRail options={filterOptions} selectedKey={filterKey} onSelect={selectRegion} />
        <View style={styles.locate}>
          <IconButton
            glyph="locate"
            accessibilityLabel={de.karte.locateLabel}
            onPress={locate}
            size={44}
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(250).springify()}
        style={[styles.bottomBar, { bottom: tabSpace }]}
        pointerEvents="box-none"
      >
        <PlaceCarousel
          places={visiblePlaces}
          unlockedIds={unlockedIds}
          selectedId={selected?.id ?? null}
          distancesM={distancesM}
          onFocus={(place) => focusPlace(place, false)}
          onOpen={(place) => focusPlace(place, true)}
        />
      </Animated.View>

      <PlaceSheet
        place={selected}
        visible={sheetOpen}
        unlock={selected ? unlocks.data?.find((u) => u.place_id === selected.id) : undefined}
        distanceM={selected ? (distancesM?.get(selected.id) ?? null) : null}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    gap: spacing.sm + 2,
  },
  locate: {
    alignSelf: 'flex-end',
    paddingRight: spacing.md,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
