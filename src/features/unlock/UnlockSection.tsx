import { Linking, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Glyph } from '@/components/Glyph';
import { de } from '@/i18n/de';
import { colors, fonts, glass, radius, spacing } from '@/theme';

import type { UnlockState } from './useUnlock';

type Props = {
  state: UnlockState;
  onStart: () => void;
  /** Freischalt-Radius des Ortes — als Hinweis, wie nah man heran muss. */
  radiusM: number;
};

/**
 * Der geprägte Messingknopf + Rückmeldungen des Unlock-Flows (§9). Zeigt nur an —
 * die Entscheidung fällt in der Edge Function.
 */
export function UnlockSection({ state, onStart, radiusM }: Props) {
  const busy = state.phase === 'locating' || state.phase === 'submitting';
  const label =
    state.phase === 'locating'
      ? de.unlock.locating
      : state.phase === 'submitting'
        ? de.unlock.submitting
        : de.unlock.cta;

  return (
    <View style={styles.wrap}>
      {state.phase === 'error' && (
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.errorBox}
          accessibilityLiveRegion="polite"
        >
          <Glyph name="compass" size={22} color={colors.brassDeep} strokeWidth={1.5} />
          <View style={styles.errorBody}>
            <Text style={styles.errorText}>{state.message}</Text>
            {state.settingsLink ? (
              <Button
                label={de.unlock.settingsOeffnen}
                variant="ghost"
                onPress={() => Linking.openSettings()}
                style={styles.errorAction}
              />
            ) : null}
          </View>
        </Animated.View>
      )}
      <Button
        label={state.phase === 'error' && state.canRetry ? de.unlock.nochmal : label}
        variant="brass"
        size="lg"
        glyph="hammer"
        fullWidth
        busy={busy}
        disabled={state.phase === 'error' && !state.canRetry && !state.settingsLink}
        onPress={onStart}
      />
      {state.phase === 'idle' && (
        <Animated.Text entering={FadeIn.delay(300)} style={styles.hint}>
          {de.unlock.hinweis(radiusM)}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: glass.paperFillStrong,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: glass.paperBorder,
    padding: spacing.md,
  },
  errorBody: {
    flex: 1,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink,
  },
  errorAction: {
    marginTop: spacing.xs,
    marginLeft: -spacing.md,
  },
  hint: {
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
});
