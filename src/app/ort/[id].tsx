import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StockBadge } from '@/badges';
import { ArtPanel } from '@/components/ArtPanel';
import { usePlaces, useUnlocks } from '@/features/places/queries';
import { PraegePop } from '@/features/unlock/PraegePop';
import { PraegeRing } from '@/features/unlock/PraegeRing';
import { UnlockSection } from '@/features/unlock/UnlockSection';
import { useUnlock } from '@/features/unlock/useUnlock';
import { de } from '@/i18n/de';
import { formatCoords, formatDateDe } from '@/lib/format';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

/** Ort-Detail — Aufbau nach dem Detail-Modal der Website (badges.js openModal). */
export default function OrtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const places = usePlaces();
  const unlocks = useUnlocks();

  const place = useMemo(() => places.data?.find((p) => p.id === id), [places.data, id]);
  const unlock = useMemo(
    () => unlocks.data?.find((u) => u.place_id === id),
    [unlocks.data, id],
  );
  const { state: unlockState, start: startUnlock } = useUnlock(typeof id === 'string' ? id : '');
  const justUnlocked = unlockState.phase === 'unlocked';
  const unlocked = Boolean(unlock) || justUnlocked;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/orte'))}
        accessibilityRole="button"
        accessibilityLabel={de.detail.zurueck}
        style={styles.back}
      >
        <Feather name="chevron-left" size={18} color={colors.ink} />
        <Text style={styles.backText}>{de.detail.zurueck}</Text>
      </Pressable>

      {!place ? (
        <View style={styles.center}>
          <Text style={textStyles.body}>
            {places.isPending ? de.orte.laden : de.detail.nichtGefunden}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
          <View style={styles.artWrap}>
            <ArtPanel>
              {justUnlocked ? (
                <PraegePop>
                  <StockBadge
                    name={place.name}
                    region={place.region}
                    elevationM={place.elevation_m}
                    motif={place.badge_motif}
                    shape={place.badge_shape}
                    tone={place.badge_tone}
                    width={212}
                  />
                </PraegePop>
              ) : (
                <StockBadge
                  name={place.name}
                  region={place.region}
                  elevationM={place.elevation_m}
                  motif={place.badge_motif}
                  shape={place.badge_shape}
                  tone={place.badge_tone}
                  locked={!unlocked}
                  width={212}
                />
              )}
              {justUnlocked && <PraegeRing size={160} />}
            </ArtPanel>
          </View>

          <View style={styles.body}>
            <Text style={styles.eyebrow}>
              {place.region} · {formatCoords(place.lat, place.lng)}
            </Text>
            <Text style={styles.name}>{place.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{place.elevation_m} m</Text>
              <View style={styles.dot} />
              <Text style={styles.meta}>{place.type}</Text>
            </View>
            <Text style={styles.desc}>{place.description}</Text>

            <View style={styles.statusRow}>
              <View style={[styles.pip, unlocked ? styles.pipDone : styles.pipLocked]} />
              <Text style={[styles.status, unlocked && styles.statusDone]}>
                {unlock
                  ? de.detail.erwandertAm(formatDateDe(unlock.unlocked_at))
                  : justUnlocked
                    ? de.detail.erwandertAm(formatDateDe(unlockState.unlockedAt))
                    : de.detail.nochNichtErwandert}
              </Text>
            </View>

            {!unlocked && <UnlockSection state={unlockState} onStart={startUnlock} />}

            {/* Shop-Teaser: sichtbar, aber deaktiviert (verbindliche Entscheidung) */}
            <View style={styles.actions}>
              <View style={styles.shopTeaser}>
                <Text style={styles.shopTeaserText}>{de.detail.shopTeaser}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  artWrap: {
    marginHorizontal: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.brassDeep,
  },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 42,
    lineHeight: 44,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brass,
  },
  desc: {
    ...textStyles.body,
    marginTop: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.paperLine,
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pipDone: {
    backgroundColor: colors.brass,
  },
  pipLocked: {
    backgroundColor: colors.lockedGray,
  },
  status: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  statusDone: {
    color: colors.brassDeep,
  },
  actions: {
    marginTop: spacing.lg,
  },
  shopTeaser: {
    backgroundColor: colors.paperLine,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    opacity: 0.9,
  },
  shopTeaserText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.inkSoft,
  },
});
