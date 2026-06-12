import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RegionFilterOption } from '@/features/map/regionFilter';
import { de } from '@/i18n/de';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  options: RegionFilterOption[];
  selectedKey: string;
  onSelect: (option: RegionFilterOption) => void;
};

/** Gebiets-Auswahl oben auf der Karte: „Alle Ziele" · Regionen · „Weitere Ziele". */
export function RegionRail({ options, selectedKey, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      style={styles.railWrap}
    >
      {options.map((option) => {
        const active = option.key === selectedKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={de.karte.regionLabel(option.title, option.placeCount)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.title}</Text>
            <View style={[styles.count, active && styles.countActive]}>
              <Text style={[styles.countText, active && styles.countTextActive]}>
                {option.placeCount}
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
    borderWidth: 1,
    borderColor: colors.paperLine,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.paper,
  },
  count: {
    minWidth: 20,
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.lockedMedalBg,
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  countActive: {
    backgroundColor: colors.brass,
  },
  countText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.inkSoft,
  },
  countTextActive: {
    color: colors.ink,
  },
});
