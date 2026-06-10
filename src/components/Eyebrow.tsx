import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, textStyles } from '@/theme';

type Props = {
  children: string;
  /** Heller Modus für Pine-Flächen (Website: .collection .eyebrow) */
  onPine?: boolean;
};

/** Eyebrow mit Brass-Strich davor (Website: index.html .eyebrow::before, 34×1 px). */
export function Eyebrow({ children, onPine = false }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.dash} />
      <Text style={[styles.text, onPine && { color: colors.brassLight }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xs,
  },
  dash: {
    width: 34,
    height: 1,
    backgroundColor: colors.brass,
  },
  text: {
    ...textStyles.eyebrow,
  },
});
