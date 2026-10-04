import { useEffect, useRef } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BadgeArt } from '@/badges';
import { GlassSurface } from '@/components/Glass';
import { Glyph } from '@/components/Glyph';
import { PressableScale } from '@/components/PressableScale';
import { StatusMark } from '@/components/StatusMark';
import { de } from '@/i18n/de';
import { tick } from '@/lib/haptics';
import { formatDistance } from '@/lib/geo';
import type { Place } from '@/lib/places';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

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

const GAP = spacing.sm + 2;

/**
 * Einrastendes Ziel-Karussell über der Tab-Leiste (AP-R3): Wischen fokussiert
 * den Ort auf der Karte, Pin-Taps scrollen mit. Die mittlere Karte steht vorn,
 * die Nachbarn treten zurück (Tiefe aus der Scrollposition, UI-Thread).
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
  const cardWidth = Math.min(width - spacing.xl * 2 - spacing.md, 330);
  const interval = cardWidth + GAP;
  const sidePadding = (width - cardWidth) / 2;
  const listRef = useRef<Animated.FlatList<Place>>(null);
  const scrollX = useSharedValue(0);
  // Zuletzt per Swipe gemeldeter Index — verhindert Scroll-Schleifen.
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

  const report = (index: number) => {
    const place = places[Math.min(Math.max(index, 0), places.length - 1)];
    if (place && index !== reportedIndex.current) {
      reportedIndex.current = index;
      tick();
      onFocus(place);
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      scheduleOnRN(report, Math.round(event.contentOffset.x / interval));
    },
  });

  return (
    <Animated.FlatList
      ref={listRef}
      data={places}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(p) => p.id}
      style={styles.listWrap}
      contentContainerStyle={{
        gap: GAP,
        paddingHorizontal: sidePadding,
        paddingVertical: spacing.sm,
      }}
      snapToInterval={interval}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      getItemLayout={(_, index) => ({ length: interval, offset: interval * index, index })}
      renderItem={({ item, index }) => (
        <CarouselCard
          place={item}
          index={index}
          interval={interval}
          width={cardWidth}
          scrollX={scrollX}
          unlocked={unlockedIds.has(item.id)}
          active={item.id === selectedId}
          distanceM={distancesM?.get(item.id)}
          onOpen={onOpen}
        />
      )}
    />
  );
}

function CarouselCard({
  place,
  index,
  interval,
  width,
  scrollX,
  unlocked,
  active,
  distanceM,
  onOpen,
}: {
  place: Place;
  index: number;
  interval: number;
  width: number;
  scrollX: SharedValue<number>;
  unlocked: boolean;
  active: boolean;
  distanceM: number | undefined;
  onOpen: (place: Place) => void;
}) {
  const depth = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value / interval - index);
    return {
      opacity: interpolate(distance, [0, 1, 2], [1, 0.72, 0.5], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(distance, [0, 1], [1, 0.92], Extrapolation.CLAMP) }],
    };
  });
  const region = place.region.split('·')[0].trim();

  return (
    <Animated.View style={[{ width }, depth]}>
      <PressableScale
        onPress={() => onOpen(place)}
        accessibilityRole="button"
        accessibilityLabel={de.karte.karussellZiel(place.name)}
        tilt={4}
      >
        <GlassSurface
          radius={radius.float}
          style={[styles.card, active && styles.cardActive]}
          intensity={40}
        >
          <BadgeArt place={place} width={46} locked={!unlocked} sheen={false} />
          <View style={styles.info}>
            <Text style={[styles.name, !unlocked && styles.nameLocked]} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {distanceM != null
                ? de.karte.entfernt(formatDistance(distanceM))
                : `${place.elevation_m} m`}
              {'  ·  '}
              {region}
            </Text>
            <View style={styles.status}>
              <StatusMark
                unlocked={unlocked}
                label={unlocked ? de.orte.statusErwandert : de.karte.chipNebel}
                size="sm"
              />
            </View>
          </View>
          <Glyph name="chevronRight" size={18} color={colors.inkSoft} style={styles.chevron} />
        </GlassSurface>
      </PressableScale>
    </Animated.View>
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
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    boxShadow: shadows.float,
  },
  cardActive: {
    borderColor: colors.brass,
    borderWidth: 1.5,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 21,
    lineHeight: 24,
    color: colors.ink,
  },
  nameLocked: {
    color: colors.lockedTextStrong,
  },
  meta: {
    marginTop: 1,
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: colors.brassDeep,
  },
  status: {
    marginTop: 4,
  },
  chevron: {
    opacity: 0.5,
  },
});
