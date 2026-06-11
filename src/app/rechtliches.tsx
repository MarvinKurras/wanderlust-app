import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow } from '@/components/Eyebrow';
import { de } from '@/i18n/de';
import { colors, fonts, spacing, textStyles } from '@/theme';

/** Impressum & Datenschutz — Platzhalter bis zum öffentlichen Release (verbindliche Entscheidung). */
export default function RechtlichesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/einstellungen'))}
        accessibilityRole="button"
        accessibilityLabel={de.einstellungen.titel}
        style={styles.back}
      >
        <Feather name="chevron-left" size={18} color={colors.ink} />
        <Text style={styles.backText}>{de.einstellungen.titel}</Text>
      </Pressable>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Text style={styles.placeholder}>{de.rechtliches.platzhalterHinweis}</Text>

        <Eyebrow>{de.einstellungen.impressum}</Eyebrow>
        <Text style={styles.text}>{de.rechtliches.impressumText}</Text>

        <View style={styles.section}>
          <Eyebrow>{de.einstellungen.datenschutz}</Eyebrow>
          <Text style={styles.text}>{de.rechtliches.datenschutzText}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  body: {
    paddingHorizontal: spacing.lg,
  },
  placeholder: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.brassDeep,
    marginBottom: spacing.lg,
  },
  text: {
    ...textStyles.body,
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
});
