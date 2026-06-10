import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StockBadge } from '@/badges';
import { de } from '@/i18n/de';
import type { Place } from '@/lib/places';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  places: Place[];
  unlockedIds: Set<string>;
  selectedId: string | null;
  onSelect: (place: Place) => void;
};

/** Horizontale Ziel-Chips über der Tab-Bar (karte.html `.rail`/`.chip`). */
export function ChipsRail({ places, unlockedIds, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      style={styles.railWrap}
    >
      {places.map((place) => {
        const unlocked = unlockedIds.has(place.id);
        const active = place.id === selectedId;
        return (
          <Pressable
            key={place.id}
            onPress={() => onSelect(place)}
            accessibilityRole="button"
            accessibilityLabel={unlocked ? place.name : de.karte.chipVerschlossen}
            style={[styles.chip, active && styles.chipActive]}
          >
            <View style={styles.medal}>
              {unlocked ? (
                <StockBadge
                  name={place.name}
                  region={place.region}
                  elevationM={place.elevation_m}
                  motif={place.badge_motif}
                  shape={place.badge_shape}
                  tone={place.badge_tone}
                  width={30}
                />
              ) : (
                <Feather name="lock" size={16} color={colors.inkSoft} />
              )}
            </View>
            <View>
              <Text style={styles.chipName}>
                {unlocked ? place.name : de.karte.chipVerschlossen}
              </Text>
              <Text style={styles.chipMeta}>
                {unlocked
                  ? `${place.elevation_m} m · ${place.region.split('·')[0].trim()}`
                  : de.karte.chipNebel}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  railWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.md,
    flexGrow: 0,
  },
  rail: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  chipActive: {
    borderColor: colors.brassDeep,
  },
  medal: {
    width: 30,
    alignItems: 'center',
  },
  chipName: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: colors.ink,
  },
  chipMeta: {
    fontFamily: fonts.mono,
    fontSize: 8.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
});
