import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { colors, spacing, textStyles } from '@/theme';

type Props = {
  message: string;
  glyph?: GlyphName;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'paper' | 'pine';
};

/** Lade-, Fehler- und Leerzustände: ein Zeichen, ein Satz, höchstens eine Aktion. */
export function StateView({
  message,
  glyph = 'compass',
  loading = false,
  actionLabel,
  onAction,
  tone = 'paper',
}: Props) {
  const pine = tone === 'pine';
  const color = pine ? colors.brassLight : colors.brassDeep;
  return (
    <View style={styles.wrap}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Glyph name={glyph} size={30} color={color} strokeWidth={1.4} />
      )}
      <Text style={[styles.text, pine && { color: colors.leadOnPine }]}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          variant="outline"
          tone={tone}
          onPress={onAction}
          glyph="refresh"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...textStyles.body,
    textAlign: 'center',
    maxWidth: 300,
  },
});
