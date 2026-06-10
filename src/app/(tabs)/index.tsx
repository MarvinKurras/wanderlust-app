import Feather from '@expo/vector-icons/Feather';
import * as Location from 'expo-location';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipsRail } from '@/features/map/ChipsRail';
import { PlacePin } from '@/features/map/PlacePin';
import { PlaceSheet } from '@/features/map/PlaceSheet';
import { regionForPlace, regionForPlaces } from '@/features/map/region';
import { usePlaces, useUnlocks } from '@/features/places/queries';
import { de } from '@/i18n/de';
import type { Place } from '@/lib/places';
import { colors, spacing, textStyles } from '@/theme';

export default function KarteScreen() {
  const insets = useSafeAreaInsets();
  const places = usePlaces();
  const unlocks = useUnlocks();
  const mapRef = useRef<MapView>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const unlockedIds = useMemo(
    () => new Set((unlocks.data ?? []).map((u) => u.place_id)),
    [unlocks.data],
  );
  const initialRegion = useMemo(() => regionForPlaces(places.data ?? []), [places.data]);

  const focusPlace = (place: Place, openSheet: boolean) => {
    setSelected(place);
    mapRef.current?.animateToRegion(regionForPlace(place), 600);
    if (openSheet) {
      setSheetOpen(true);
    }
  };

  // Eigener Standort on demand (A-AP5-3): Permission erst beim Tap anfragen.
  const locate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      setShowLocation(true);
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
        {(places.data ?? []).map((place) => (
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
      </MapView>

      <Pressable
        onPress={locate}
        accessibilityRole="button"
        accessibilityLabel={de.karte.locateLabel}
        style={[styles.locate, { top: insets.top + spacing.md }]}
      >
        <Feather name="crosshair" size={18} color={colors.ink} />
      </Pressable>

      <ChipsRail
        places={places.data ?? []}
        unlockedIds={unlockedIds}
        selectedId={selected?.id ?? null}
        onSelect={(place) => focusPlace(place, true)}
      />

      {sheetOpen && selected && (
        <PlaceSheet
          place={selected}
          unlock={unlocks.data?.find((u) => u.place_id === selected.id)}
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
