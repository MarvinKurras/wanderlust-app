import Feather from '@expo/vector-icons/Feather';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow } from '@/components/Eyebrow';
import { deleteAccount, upgradeWithEmail } from '@/features/account/account';
import { de } from '@/i18n/de';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

export default function EinstellungenScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [upgradeState, setUpgradeState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAccountEmail(data.user?.email ?? null));
  }, []);

  const upgrade = async () => {
    setUpgradeState('busy');
    try {
      await upgradeWithEmail(email.trim());
      setUpgradeState('sent');
    } catch {
      setUpgradeState('error');
    }
  };

  const confirmDelete = () => {
    Alert.alert(de.einstellungen.loeschenTitel, de.einstellungen.loeschenText, [
      { text: de.einstellungen.abbrechen, style: 'cancel' },
      {
        text: de.einstellungen.loeschenBestaetigen,
        style: 'destructive',
        onPress: async () => {
          setDeleteBusy(true);
          try {
            await deleteAccount();
            queryClient.clear();
            router.dismissAll();
            router.replace('/onboarding');
          } catch {
            setDeleteBusy(false);
            Alert.alert(de.einstellungen.loeschenFehler);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/sammlung'))}
        accessibilityRole="button"
        accessibilityLabel={de.einstellungen.zurueck}
        style={styles.back}
      >
        <Feather name="chevron-left" size={18} color={colors.ink} />
        <Text style={styles.backText}>{de.einstellungen.zurueck}</Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.body}>
          <Text style={styles.title}>{de.einstellungen.titel}</Text>

          <Eyebrow>{de.einstellungen.kontoEyebrow}</Eyebrow>
          {accountEmail ? (
            <Text style={styles.text}>{de.einstellungen.kontoMitEmail(accountEmail)}</Text>
          ) : (
            <>
              <Text style={styles.text}>{de.einstellungen.kontoAnonym}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={de.einstellungen.emailPlatzhalter}
                placeholderTextColor={colors.lockedGray}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={styles.input}
              />
              <Pressable
                onPress={upgrade}
                disabled={upgradeState === 'busy' || email.trim().length < 5}
                accessibilityRole="button"
                style={[styles.cta, (upgradeState === 'busy' || email.trim().length < 5) && styles.ctaDisabled]}
              >
                <Text style={styles.ctaText}>{de.einstellungen.upgradeCta}</Text>
              </Pressable>
              {upgradeState === 'sent' && (
                <Text style={styles.hintOk}>{de.einstellungen.upgradeGesendet}</Text>
              )}
              {upgradeState === 'error' && (
                <Text style={styles.hintError}>{de.einstellungen.upgradeFehler}</Text>
              )}
            </>
          )}

          <View style={styles.section}>
            <Eyebrow>{de.einstellungen.rechtlichesEyebrow}</Eyebrow>
            <Pressable
              onPress={() => router.push('/rechtliches')}
              accessibilityRole="button"
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>
                {de.einstellungen.impressum} · {de.einstellungen.datenschutz}
              </Text>
              <Feather name="chevron-right" size={16} color={colors.inkSoft} />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Eyebrow>{de.einstellungen.loeschenEyebrow}</Eyebrow>
            <Pressable
              onPress={confirmDelete}
              disabled={deleteBusy}
              accessibilityRole="button"
              style={[styles.danger, deleteBusy && styles.ctaDisabled]}
            >
              <Text style={styles.dangerText}>{de.einstellungen.loeschenCta}</Text>
            </Pressable>
          </View>
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
  title: {
    ...textStyles.title,
    marginBottom: spacing.lg,
  },
  text: {
    ...textStyles.body,
    marginTop: spacing.md,
  },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.paperLine,
    borderRadius: radius.chip,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.paperDeep,
  },
  cta: {
    marginTop: spacing.md,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.paper,
  },
  hintOk: {
    marginTop: spacing.sm,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.brassDeep,
  },
  hintError: {
    marginTop: spacing.sm,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  section: {
    marginTop: spacing.xl,
  },
  linkRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
  },
  linkText: {
    ...textStyles.body,
    color: colors.ink,
  },
  danger: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.brassDeep,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  dangerText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.brassDeep,
  },
});
