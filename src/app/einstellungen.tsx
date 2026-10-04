import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Atmosphere } from '@/components/atmosphere/Atmosphere';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GlassSurface } from '@/components/Glass';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { CompactHeader, LargeTitle, useCollapsingHeader } from '@/components/ScreenChrome';
import { deleteAccount, upgradeWithEmail } from '@/features/account/account';
import { de } from '@/i18n/de';
import { isPreview } from '@/lib/preview';
import { supabase } from '@/lib/supabase';
import { colors, fonts, glass, radius, spacing, textStyles } from '@/theme';

function Section({
  glyph,
  title,
  children,
}: {
  glyph: GlyphName;
  title: string;
  children: ReactNode;
}) {
  return (
    <GlassSurface radius={22} style={styles.section} intensity={30}>
      <View style={styles.sectionHead}>
        <Glyph name={glyph} size={18} color={colors.brassDeep} strokeWidth={1.6} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </GlassSurface>
  );
}

export default function EinstellungenScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { scrollY, onScroll } = useCollapsingHeader();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [upgradeState, setUpgradeState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    if (isPreview) return;
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

  const doDelete = async () => {
    setDeleteBusy(true);
    setDeleteError(false);
    try {
      await deleteAccount();
      queryClient.clear();
      setConfirmOpen(false);
      router.dismissAll();
      router.replace('/onboarding');
    } catch {
      setDeleteBusy(false);
      setConfirmOpen(false);
      setDeleteError(true);
    }
  };

  const back = (
    <IconButton
      glyph="chevronLeft"
      accessibilityLabel={de.allgemein.zurueck}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/sammlung'))}
    />
  );
  const emailValid = email.trim().length >= 5 && email.includes('@');

  return (
    <View style={styles.screen}>
      <Atmosphere variant="paper" scrollY={scrollY} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={{ height: 40 }} />
        <LargeTitle
          eyebrow={de.einstellungen.eyebrow}
          title={de.einstellungen.titel}
          scrollY={scrollY}
          flush
        />

        <Section glyph="stock" title={de.einstellungen.kontoEyebrow}>
          {accountEmail ? (
            <Text style={styles.text}>{de.einstellungen.kontoMitEmail(accountEmail)}</Text>
          ) : (
            <>
              <Text style={styles.text}>{de.einstellungen.kontoAnonym}</Text>
              <View style={styles.inputWrap}>
                <Glyph name="mail" size={18} color={colors.inkSoft} strokeWidth={1.5} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={de.einstellungen.emailPlatzhalter}
                  placeholderTextColor={colors.lockedGray}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={styles.input}
                  accessibilityLabel={de.einstellungen.emailLabel}
                />
              </View>
              <Button
                label={de.einstellungen.upgradeCta}
                onPress={upgrade}
                busy={upgradeState === 'busy'}
                disabled={!emailValid}
                glyph="shield"
                fullWidth
                style={styles.cta}
              />
              {upgradeState === 'sent' && (
                <Text style={styles.hintOk}>{de.einstellungen.upgradeGesendet}</Text>
              )}
              {upgradeState === 'error' && (
                <Text style={styles.hintError}>{de.einstellungen.upgradeFehler}</Text>
              )}
            </>
          )}
        </Section>

        <Section glyph="shield" title={de.einstellungen.rechtlichesEyebrow}>
          <PressableScale
            onPress={() => router.push('/rechtliches')}
            accessibilityRole="button"
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>
              {de.einstellungen.impressum} · {de.einstellungen.datenschutz}
            </Text>
            <Glyph name="chevronRight" size={18} color={colors.inkSoft} />
          </PressableScale>
        </Section>

        <Section glyph="trash" title={de.einstellungen.loeschenEyebrow}>
          <Text style={styles.text}>{de.einstellungen.loeschenHinweis}</Text>
          <Button
            label={de.einstellungen.loeschenCta}
            variant="outline"
            glyph="trash"
            onPress={() => setConfirmOpen(true)}
            disabled={deleteBusy}
            style={styles.cta}
          />
          {deleteError && <Text style={styles.hintError}>{de.einstellungen.loeschenFehler}</Text>}
        </Section>

        <Text style={styles.version}>
          {de.einstellungen.version(Constants.expoConfig?.version ?? '0.0.0')}
        </Text>
      </Animated.ScrollView>

      <CompactHeader title={de.einstellungen.titel} scrollY={scrollY} left={back} threshold={50} />

      <ConfirmDialog
        visible={confirmOpen}
        title={de.einstellungen.loeschenTitel}
        message={de.einstellungen.loeschenText}
        confirmLabel={de.einstellungen.loeschenBestaetigen}
        cancelLabel={de.einstellungen.abbrechen}
        destructive
        busy={deleteBusy}
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
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
  section: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.eyebrow,
    fontSize: 11,
    letterSpacing: 2,
  },
  text: {
    ...textStyles.body,
    fontSize: 15,
    lineHeight: 23,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: glass.paperBorder,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.paper,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + spacing.xs,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  cta: {
    marginTop: spacing.xs,
  },
  hintOk: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.brassDeep,
  },
  hintError: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  linkText: {
    ...textStyles.body,
    color: colors.ink,
  },
  version: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    opacity: 0.7,
  },
});
