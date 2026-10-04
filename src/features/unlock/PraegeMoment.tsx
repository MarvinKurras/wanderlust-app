import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgeArt } from '@/badges';
import { Glow, Stars } from '@/components/atmosphere/SkyLife';
import { Button } from '@/components/Button';
import { de } from '@/i18n/de';
import { formatDateDe } from '@/lib/format';
import { praege, PRAEGE_SCHLAEGE_MS } from '@/lib/haptics';
import { motionSprings } from '@/lib/motion';
import type { Place } from '@/lib/places';
import { colors, fonts, landscape, spacing, textStyles } from '@/theme';

import { PraegeRing } from './PraegeRing';
import { SparkBurst } from './SparkBurst';

type Props = {
  place: Place;
  unlockedAt: string;
  visible: boolean;
  onDone: () => void;
};

/**
 * Der Moment der Prägung (AP-D): Das Schild fällt in die Bühne, drei
 * Hammerschläge (Haptik, Stoß, Ringwelle, Funken) schälen es Schlag für Schlag
 * aus dem Nebel, dann zieht der Messingglanz darüber. Wird erst gezeigt, NACHDEM
 * die Edge Function `unlock` bestätigt hat — die Inszenierung entscheidet nichts.
 */
export function PraegeMoment({ place, unlockedAt, visible, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const badgeWidth = Math.min(240, width * 0.6);

  const enter = useSharedValue(0);
  const reveal = useSharedValue(reducedMotion ? 1 : 0);
  const punch = useSharedValue(1);
  const shake = useSharedValue(0);
  const [strike, setStrike] = useState(0);
  const [settledByTimer, setSettled] = useState(false);
  const settled = reducedMotion || settledByTimer;

  useEffect(() => {
    if (!visible) return;
    enter.value = withSpring(1, motionSprings.pop);
    if (reducedMotion) return;
    const cancelHaptics = praege();
    const timers = PRAEGE_SCHLAEGE_MS.map((ms, i) =>
      setTimeout(() => {
        setStrike(i + 1);
        reveal.value = withTiming((i + 1) / PRAEGE_SCHLAEGE_MS.length, { duration: 200 });
        punch.value = withSequence(
          withTiming(0.92, { duration: 70 }),
          withSpring(1, motionSprings.pop),
        );
        shake.value = withSequence(
          withTiming(-6, { duration: 40 }),
          withTiming(5, { duration: 60 }),
          withTiming(-2, { duration: 60 }),
          withTiming(0, { duration: 60 }),
        );
      }, ms),
    );
    const settle = setTimeout(() => setSettled(true), PRAEGE_SCHLAEGE_MS[2] + 450);
    return () => {
      cancelHaptics();
      timers.forEach(clearTimeout);
      clearTimeout(settle);
    };
  }, [visible, reducedMotion, enter, reveal, punch, shake]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(enter.value > 0 ? 1 : 0, { duration: 280 }),
  }));
  const stageStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateX: shake.value },
      { translateY: (1 - enter.value) * -60 },
      { scale: punch.value * (0.9 + enter.value * 0.1) },
    ],
  }));
  const goldStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const fogStyle = useAnimatedStyle(() => ({ opacity: 1 - reveal.value }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: withDelay(100, withTiming(0.35 + reveal.value * 0.65, { duration: 300 })),
  }));

  const badgeHeight = (badgeWidth * 252) / 220;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDone}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Stars width={width} height={height * 0.7} count={36} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle]}>
        <Glow size={width * 1.3} x={width / 2} y={height * 0.4} color={landscape.moonGlow} />
      </Animated.View>

      <View
        style={[
          styles.center,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={{ width: badgeWidth, height: badgeHeight }}>
          <PraegeRing size={badgeWidth * 0.9} pulse={strike} />
          <SparkBurst burst={strike} reach={badgeWidth * 0.9} />
          <Animated.View style={[{ width: badgeWidth, height: badgeHeight }, stageStyle]}>
            <Animated.View style={fogStyle}>
              <BadgeArt place={place} width={badgeWidth} locked fog sheen={false} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, goldStyle]}>
              <BadgeArt place={place} width={badgeWidth} locked={false} sheen={settled} />
            </Animated.View>
          </Animated.View>
        </View>

        {settled && (
          <View style={styles.copy}>
            <Animated.Text entering={FadeInDown.delay(50).springify()} style={styles.eyebrow}>
              {de.praegung.eyebrow}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(140).springify()} style={styles.name}>
              {place.name}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(230).springify()} style={styles.verse}>
              {de.praegung.zeile(formatDateDe(unlockedAt))}
            </Animated.Text>
            <Animated.View entering={FadeInDown.delay(380).springify()} style={styles.actions}>
              <Button
                label={de.praegung.weiter}
                variant="brass"
                size="lg"
                fullWidth
                glyph="check"
                onPress={onDone}
              />
              <Button
                label={de.praegung.zurSammlung}
                variant="ghost"
                tone="pine"
                fullWidth
                onPress={() => {
                  onDone();
                  router.navigate('/sammlung');
                }}
              />
            </Animated.View>
          </View>
        )}
        {!settled && <Text style={styles.hammer}>{de.unlock.submitting}</Text>}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: colors.pine,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  copy: {
    alignItems: 'center',
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 380,
  },
  eyebrow: {
    ...textStyles.eyebrow,
    color: colors.brassLight,
  },
  name: {
    ...textStyles.hero,
    fontSize: 46,
    lineHeight: 50,
    color: colors.paperOnPine,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  verse: {
    ...textStyles.verse,
    color: colors.leadOnPine,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  actions: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  hammer: {
    marginTop: spacing.xl,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.paperOnPineDim,
  },
});
