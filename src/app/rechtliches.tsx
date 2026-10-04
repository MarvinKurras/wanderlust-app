import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Atmosphere } from '@/components/atmosphere/Atmosphere';
import { GlassSurface } from '@/components/Glass';
import { IconButton } from '@/components/IconButton';
import { CompactHeader, LargeTitle, useCollapsingHeader } from '@/components/ScreenChrome';
import { de } from '@/i18n/de';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

/** Impressum & Datenschutz — Platzhalter bis zum öffentlichen Release (verbindliche Entscheidung). */
export default function RechtlichesScreen() {
  const insets = useSafeAreaInsets();
  const { scrollY, onScroll } = useCollapsingHeader();

  const back = (
    <IconButton
      glyph="chevronLeft"
      accessibilityLabel={de.einstellungen.titel}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/einstellungen'))}
    />
  );

  return (
    <View style={styles.screen}>
      <Atmosphere variant="paper" scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={{ height: 40 }} />
        <LargeTitle
          eyebrow={de.einstellungen.rechtlichesEyebrow}
          title={de.rechtliches.titel}
          scrollY={scrollY}
          flush
        />

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>{de.rechtliches.platzhalterHinweis}</Text>
        </View>

        <GlassSurface radius={22} style={styles.card} intensity={30}>
          <Text style={styles.heading}>{de.einstellungen.impressum}</Text>
          <Text style={styles.text}>{de.rechtliches.impressumText}</Text>
        </GlassSurface>

        <GlassSurface radius={22} style={styles.card} intensity={30}>
          <Text style={styles.heading}>{de.einstellungen.datenschutz}</Text>
          <Text style={styles.text}>{de.rechtliches.datenschutzText}</Text>
        </GlassSurface>
      </Animated.ScrollView>
      <CompactHeader title={de.rechtliches.titel} scrollY={scrollY} left={back} threshold={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  placeholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brassDeep,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  placeholderText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    lineHeight: 17,
    color: colors.brassDeep,
  },
  card: {
    padding: spacing.lg,
  },
  heading: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  text: {
    ...textStyles.body,
    fontSize: 15,
    lineHeight: 24,
  },
});
