import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, textStyles } from '@/theme';

type Props = {
  eyebrow: string;
  title: string;
  body: string;
  /** Sammlung nutzt die dunkle Pine-Welt der Website */
  variant?: 'paper' | 'pine';
};

/** Platzhalter aus AP1 — wird in AP4/AP5/AP7 durch die echten Screens ersetzt. */
export function PlaceholderScreen({ eyebrow, title, body, variant = 'paper' }: Props) {
  const insets = useSafeAreaInsets();
  const dark = variant === 'pine';

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.xl },
        dark && { backgroundColor: colors.pine },
      ]}
    >
      <Text style={[styles.eyebrow, dark && { color: colors.brassLight }]}>{eyebrow}</Text>
      <Text style={[styles.title, dark && { color: colors.paperOnPine }]}>{title}</Text>
      <Text style={[styles.body, dark && { color: 'rgba(239,229,210,0.66)' }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },
  eyebrow: {
    ...textStyles.eyebrow,
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.title,
    marginBottom: spacing.md,
  },
  body: {
    ...textStyles.body,
    maxWidth: 320,
  },
});
