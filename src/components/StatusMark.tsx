import { StyleSheet, Text, View } from 'react-native';

import { Glyph } from '@/components/Glyph';
import { colors, fonts, spacing } from '@/theme';

type Props = {
  unlocked: boolean;
  /** Text für den jeweiligen Zustand (zentral aus `de.ts`). */
  label: string;
  tone?: 'paper' | 'pine';
  size?: 'sm' | 'md';
};

/** Zustand eines Ortes als Zeichen + kurzes Wort: Messing-Haken oder Schloss im Nebel. */
export function StatusMark({ unlocked, label, tone = 'paper', size = 'md' }: Props) {
  const pine = tone === 'pine';
  const color = unlocked
    ? pine
      ? colors.brassLight
      : colors.brassDeep
    : pine
      ? colors.paperOnPineDim
      : colors.inkSoft;
  const small = size === 'sm';
  return (
    <View style={styles.row}>
      <Glyph
        name={unlocked ? 'check' : 'lock'}
        size={small ? 12 : 14}
        color={color}
        strokeWidth={unlocked ? 2.2 : 1.8}
      />
      <Text style={[styles.label, small && styles.small, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  small: {
    fontSize: 8.5,
    letterSpacing: 0.9,
  },
});
