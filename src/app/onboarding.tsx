import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  FadeOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Atmosphere } from '@/components/atmosphere/Atmosphere';
import { Button } from '@/components/Button';
import { GlassSurface } from '@/components/Glass';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { markOnboardingSeen } from '@/features/onboarding/onboardingFlag';
import { SketchUnderline } from '@/features/onboarding/SketchUnderline';
import { de } from '@/i18n/de';
import { tick } from '@/lib/haptics';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

/** Website „So funktioniert's": Besuchen · Freischalten · Sammeln (Icons 1:1). */
const STEP_GLYPHS: GlyphName[] = ['visit', 'emboss', 'stock'];
/** -1 = Wörterbuch-Eintrag (Hero), 0–2 = Schritte, 3 = Standort-Priming */
type Step = -1 | 0 | 1 | 2 | 3;

/**
 * Erststart (AP8) im Website-Hero (AP-D): Morgenbühne, deren Bergketten sich
 * selbst skizzieren, darauf der Wörterbuch-Eintrag „Wanderlust". Danach die drei
 * Schritte und das Permission-Priming (§9/§10) — App bleibt ohne Permission nutzbar.
 */
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<Step>(-1);
  const current = step >= 0 && step < 3 ? de.onboarding.schritte[step as 0 | 1 | 2] : null;

  const finish = async () => {
    await markOnboardingSeen();
    router.replace('/');
  };

  const allowLocation = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } finally {
      await finish();
    }
  };

  const go = (next: number) => {
    const clamped = Math.max(-1, Math.min(3, next)) as Step;
    if (clamped !== step) {
      tick();
      setStep(clamped);
    }
  };

  // Wischen blättert wie durch ein Wanderbuch
  const swipe = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .onEnd((event) => {
      if (event.translationX < -60) scheduleOnRN(go, step + 1);
      else if (event.translationX > 60 && step > 0) scheduleOnRN(go, step - 1);
    });

  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.screen}>
        <Atmosphere variant="dawn" />

        {step === -1 ? (
          <Animated.View
            key="hero"
            exiting={FadeOutUp.duration(380)}
            style={[styles.hero, { paddingTop: insets.top + spacing.xxl * 1.6 }]}
          >
            <Animated.Text entering={FadeInDown.delay(450).duration(1000)} style={styles.kicker}>
              {de.onboarding.kicker}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(650).duration(1100)} style={styles.wordmark}>
              {de.onboarding.titel}
            </Animated.Text>
            <Animated.View entering={FadeIn.delay(900)}>
              <SketchUnderline width={Math.min(width * 0.7, 300)} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(1050).duration(1000)} style={styles.phon}>
              <Text style={styles.phonText}>{de.onboarding.lautschrift}</Text>
              <View style={styles.phonDot} />
              <Text style={styles.phonPos}>{de.onboarding.wortart}</Text>
            </Animated.View>
            <Animated.Text
              entering={FadeInDown.delay(1250).duration(1000)}
              style={styles.definition}
            >
              {de.onboarding.definition}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(1450).duration(1000)} style={styles.defTag}>
              {de.onboarding.defTag}
            </Animated.Text>
          </Animated.View>
        ) : (
          <View style={{ height: insets.top + spacing.xl }} />
        )}

        <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
          {step === -1 ? (
            <Animated.View entering={FadeInDown.delay(2100).springify()} style={styles.heroCta}>
              <Button
                label={de.onboarding.los}
                variant="brass"
                size="lg"
                fullWidth
                glyph="arrowRight"
                onPress={() => go(0)}
              />
            </Animated.View>
          ) : (
            <GlassSurface radius={28} style={styles.card} intensity={45}>
              <Animated.View
                key={step}
                entering={FadeInRight.springify()}
                exiting={FadeOutLeft.duration(160)}
              >
                {current ? (
                  <>
                    <Glyph
                      name={STEP_GLYPHS[step]}
                      size={46}
                      color={colors.brassDeep}
                      strokeWidth={1.3}
                    />
                    <Text style={styles.idx}>{current.idx}</Text>
                    <Text style={styles.stepTitle}>{current.titel}</Text>
                    <Text style={styles.stepText}>{current.text}</Text>
                  </>
                ) : (
                  <>
                    <Glyph name="shield" size={46} color={colors.brassDeep} strokeWidth={1.3} />
                    <Text style={styles.idx}>{de.onboarding.primingIdx}</Text>
                    <Text style={styles.stepTitle}>{de.onboarding.primingTitel}</Text>
                    <Text style={styles.stepText}>{de.onboarding.primingText}</Text>
                  </>
                )}
              </Animated.View>

              <View style={styles.dots}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
                ))}
              </View>

              {step < 3 ? (
                <Button
                  label={de.onboarding.weiter}
                  size="lg"
                  fullWidth
                  glyph="arrowRight"
                  onPress={() => go(step + 1)}
                />
              ) : (
                <View style={styles.primingActions}>
                  <Button
                    label={de.onboarding.primingErlauben}
                    variant="brass"
                    size="lg"
                    fullWidth
                    glyph="locate"
                    onPress={allowLocation}
                  />
                  <Button
                    label={de.onboarding.primingSpaeter}
                    variant="ghost"
                    fullWidth
                    onPress={finish}
                  />
                </View>
              )}
            </GlassSurface>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  wordmark: {
    ...textStyles.hero,
    fontSize: 72,
    lineHeight: 72,
    textAlign: 'center',
  },
  phon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  phonText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  phonDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brassDeep,
  },
  phonPos: {
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    color: colors.inkSoft,
  },
  definition: {
    ...textStyles.verse,
    fontSize: 21,
    lineHeight: 31,
    color: colors.ink,
    textAlign: 'center',
    maxWidth: 360,
    marginTop: spacing.lg,
  },
  defTag: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.brassDeep,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  heroCta: {
    paddingHorizontal: spacing.sm,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 28,
  },
  idx: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.brassDeep,
    marginTop: spacing.md,
  },
  stepTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  stepText: {
    ...textStyles.body,
    marginTop: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.paperLine,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.brassDeep,
  },
  primingActions: {
    gap: spacing.xs,
  },
});
