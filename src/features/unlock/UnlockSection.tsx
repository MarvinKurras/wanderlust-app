import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { de } from '@/i18n/de';
import { colors, fonts, radius, spacing } from '@/theme';

import type { UnlockState } from './useUnlock';

type Props = {
  state: UnlockState;
  onStart: () => void;
};

/** Prägen-Button + Statusmeldungen des Unlock-Flows (Detail-Screen). */
export function UnlockSection({ state, onStart }: Props) {
  const busy = state.phase === 'locating' || state.phase === 'submitting';

  if (state.phase === 'unlocked') {
    return <Text style={styles.success}>{de.unlock.erfolg}</Text>;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onStart}
        disabled={busy}
        accessibilityRole="button"
        style={[styles.cta, busy && styles.ctaBusy]}
      >
        <Text style={styles.ctaText}>
          {state.phase === 'locating'
            ? de.unlock.locating
            : state.phase === 'submitting'
              ? de.unlock.submitting
              : de.unlock.cta}
        </Text>
      </Pressable>

      {state.phase === 'error' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{state.message}</Text>
          {state.settingsLink ? (
            <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
              <Text style={styles.link}>{de.unlock.settingsOeffnen}</Text>
            </Pressable>
          ) : state.canRetry ? (
            <Pressable onPress={onStart} accessibilityRole="button">
              <Text style={styles.link}>{de.unlock.nochmal}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
  },
  cta: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaBusy: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.paper,
  },
  success: {
    marginTop: spacing.lg,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.brassDeep,
  },
  errorBox: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  link: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.brassDeep,
  },
});
