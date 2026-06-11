import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { markOnboardingSeen } from '@/features/onboarding/onboardingFlag';
import { de } from '@/i18n/de';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

/**
 * Erststart-Onboarding: 3 Schritte aus Website „So funktioniert's"
 * + Permission-Priming (§9/§10) — App bleibt ohne Permission nutzbar.
 */
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const steps = de.onboarding.schritte;
  const isPriming = step === steps.length;

  const finish = async () => {
    await markOnboardingSeen();
    router.replace('/');
  };

  const allowLocation = async () => {
    await Location.requestForegroundPermissionsAsync();
    await finish();
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.kicker}>{de.onboarding.kicker}</Text>
      <Text style={styles.wordmark}>{de.onboarding.titel}</Text>

      <View style={styles.card}>
        <Text style={styles.idx}>{isPriming ? de.onboarding.primingIdx : steps[step].idx}</Text>
        <Text style={styles.stepTitle}>
          {isPriming ? de.onboarding.primingTitel : steps[step].titel}
        </Text>
        <Text style={styles.stepText}>
          {isPriming ? de.onboarding.primingText : steps[step].text}
        </Text>
      </View>

      <View style={styles.dots}>
        {[...steps, null].map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {isPriming ? (
        <View style={styles.actions}>
          <Pressable onPress={allowLocation} accessibilityRole="button" style={styles.cta}>
            <Text style={styles.ctaText}>{de.onboarding.primingErlauben}</Text>
          </Pressable>
          <Pressable onPress={finish} accessibilityRole="button" style={styles.ghost}>
            <Text style={styles.ghostText}>{de.onboarding.primingSpaeter}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            onPress={() => setStep((s) => s + 1)}
            accessibilityRole="button"
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{de.onboarding.weiter}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    textAlign: 'center',
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 58,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 360,
    alignSelf: 'center',
  },
  idx: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.brassDeep,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 32,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  stepText: {
    ...textStyles.body,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.paperLine,
  },
  dotActive: {
    backgroundColor: colors.brassDeep,
  },
  actions: {
    gap: spacing.md,
    alignItems: 'center',
  },
  cta: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    minWidth: 220,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.paper,
  },
  ghost: {
    paddingVertical: spacing.sm,
  },
  ghostText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
});
