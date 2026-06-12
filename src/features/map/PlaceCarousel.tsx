import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { StockBadge } from '@/badges';
import { de } from '@/i18n/de';
import { formatDistance } from '@/lib/geo';
import type { Place } from '@/lib/places';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  places: Place[];
  unlockedIds: Set<string>;
  selectedId: string | null;
  /** Luftlinien-Distanzen vom eigenen Standort (m); null ohne Standortfreigabe. */
  distancesM: Map<string, number> | null;
  /** Wischen rastet auf einer Karte ein → Karte fokussiert den Ort. */
  onFocus: (place: Place) => void;
  /** Tap auf eine Karte → Ort fokussieren und Sheet öffnen. */
  onOpen: (place: Place) => void;
};

const GAP = spacing.sm;

/**
 * Einrastendes Ziel-Karussell über der Tab-Bar: Wischen fokussiert den Ort
 * auf der Karte, Pin-Taps scrollen das Karussell mit (AP-R3).
 * Namen sind auch verschlossen lesbar (A-R3-1) — der Nebel bleibt Status.
 */
export function PlaceCarousel({
  places,
  unlockedIds,
  selectedId,
  distancesM,
  onFocus,
  onOpen,
}: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - spacing.xl * 2, 340);
  const sidePadding = (width - cardWidth) / 2;
  const listRef = useRef<FlatList<Place>>(null);
  // Zuletzt per Swipe gemeldeter Index — verhindert Scroll-Schleifen, wenn
  // die eigene Meldung als selectedId zurückkommt.
  const reportedIndex = useRef(-1);

  const selectedIndex = selectedId ? places.findIndex((p) => p.id === selectedId) : -1;

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex !== reportedIndex.current) {
      listRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
      reportedIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  // Filterwechsel: zurück an den Anfang, alte Swipe-Position vergessen
  useEffect(() => {
    reportedIndex.current = -1;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [places]);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + GAP));
    const place = places[Math.min(Math.max(index, 0), places.length - 1)];
    if (place && index !== reportedIndex.current) {
      reportedIndex.current = index;
      onFocus(place);
    }
  };

  return (
    <FlatList
      ref={listRef}
      data={places}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(p) => p.id}
      style={styles.listWrap}
      contentContainerStyle={{ gap: GAP, paddingHorizontal: sidePadding }}
      snapToInterval={cardWidth + GAP}
      decelerationRate="fast"
      onMomentumScrollEnd={onMomentumEnd}
      getItemLayout={(_, index) => ({
        length: cardWidth + GAP,
        offset: (cardWidth + GAP) * index,
        index,
      })}
      renderItem={({ item: place }) => {
        const unlocked = unlockedIds.has(place.id);
        const active = place.id === selectedId;
        const distance = distancesM?.get(place.id);
        return (
          <Pressable
            onPress={() => onOpen(place)}
            accessibilityRole="button"
            accessibilityLabel={de.karte.karussellZiel(place.name)}
            style={[styles.card, { width: cardWidth }, active && styles.cardActive]}
          >
            <View style={[styles.medal, !unlocked && styles.medalLocked]}>
              {unlocked ? (
                <StockBadge
                  name={place.name}
                  region={place.region}
                  elevationM={place.elevation_m}
                  motif={place.badge_motif}
                  shape={place.badge_shape}
                  tone={place.badge_tone}
                  width={38}
                />
              ) : (
                <Feather name="lock" size={16} color={colors.inkSoft} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, !unlocked && styles.nameLocked]} numberOfLines={1}>
                {place.name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {distance != null
                  ? `${de.karte.entfernt(formatDistance(distance))} · ${place.region.split('·')[0].trim()}`
                  : `${place.elevation_m} m · ${place.region.split('·')[0].trim()}`}
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.pip, unlocked ? styles.pipDone : styles.pipLocked]} />
                <Text style={[styles.status, unlocked && styles.statusDone]}>
                  {unlocked ? de.orte.statusErwandert : de.karte.chipNebel}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color={colors.inkSoft} style={styles.chevron} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flexGrow: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.paperLine,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cardActive: {
    borderColor: colors.brassDeep,
  },
  medal: {
    width: 40,
    alignItems: 'center',
  },
  medalLocked: {
    backgroundColor: colors.lockedMedalBg,
    borderRadius: radius.chip,
    paddingVertical: spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.ink,
  },
  nameLocked: {
    color: colors.lockedTextStrong,
  },
  meta: {
    marginTop: 1,
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: colors.brassDeep,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 3,
  },
  pip: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pipDone: {
    backgroundColor: colors.brass,
  },
  pipLocked: {
    backgroundColor: colors.lockedGray,
  },
  status: {
    fontFamily: fonts.mono,
    fontSize: 8.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  statusDone: {
    color: colors.brassDeep,
  },
  chevron: {
    opacity: 0.55,
  },
});
