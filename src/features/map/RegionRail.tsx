import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/Glass';
import { PressableScale } from '@/components/PressableScale';
import type { RegionFilterOption } from '@/features/map/regionFilter';
import { de } from '@/i18n/de';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  options: RegionFilterOption[];
  selectedKey: string;
  onSelect: (option: RegionFilterOption) => void;
};

/** Gebiets-Auswahl oben auf der Karte: „Alle Ziele" · Regionen · „Weitere Ziele" — als Glas-Chips. */
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
          <PressableScale
            key={option.key}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={de.karte.regionLabel(option.title, option.placeCount)}
            scaleTo={0.94}
          >
            {active ? (
              <View style={[styles.chip, styles.chipActive]}>
                <Text style={[styles.chipText, styles.chipTextActive]}>{option.title}</Text>
                <View style={[styles.count, styles.countActive]}>
                  <Text style={[styles.countText, styles.countTextActive]}>
                    {option.placeCount}
                  </Text>
                </View>
              </View>
            ) : (
              <GlassSurface radius={radius.pill} interactive style={styles.chip}>
                <Text style={styles.chipText}>{option.title}</Text>
                <View style={styles.count}>
                  <Text style={styles.countText}>{option.placeCount}</Text>
                </View>
              </GlassSurface>
            )}
          </PressableScale>
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
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.monoMedium,
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
