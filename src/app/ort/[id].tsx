import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BadgeArt } from '@/badges';
import { Ranges } from '@/components/atmosphere/Ranges';
import { Glow, Stars } from '@/components/atmosphere/SkyLife';
import { GlassSurface } from '@/components/Glass';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { IconButton } from '@/components/IconButton';
import { CompactHeader, useCollapsingHeader } from '@/components/ScreenChrome';
import { StateView } from '@/components/StateView';
import { StatusMark } from '@/components/StatusMark';
import { useKnownPosition } from '@/features/map/useKnownPosition';
import { usePlaces, useUnlocks } from '@/features/places/queries';
import { PraegeMoment } from '@/features/unlock/PraegeMoment';
import { UnlockSection } from '@/features/unlock/UnlockSection';
import { useUnlock } from '@/features/unlock/useUnlock';
import { de } from '@/i18n/de';
import { formatCoords, formatDateDe } from '@/lib/format';
import { formatDistance, haversineM } from '@/lib/geo';
import { useTilt } from '@/lib/tilt';
import { colors, fonts, landscape, radius, spacing, textStyles } from '@/theme';

function MetaChip({ glyph, label }: { glyph: GlyphName; label: string }) {
  return (
    <View style={styles.chip}>
      <Glyph name={glyph} size={14} color={colors.brassDeep} strokeWidth={1.7} />
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Ort-Detail — Bühne mit Schild (Website: badges.js openModal), darunter das Pergamentblatt. */
export default function OrtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const places = usePlaces();
  const unlocks = useUnlocks();
  const tilt = useTilt();
  const here = useKnownPosition();
  const { scrollY, onScroll } = useCollapsingHeader();

  const place = useMemo(() => places.data?.find((p) => p.id === id), [places.data, id]);
  const unlock = useMemo(() => unlocks.data?.find((u) => u.place_id === id), [unlocks.data, id]);
  const { state: unlockState, start: startUnlock } = useUnlock(typeof id === 'string' ? id : '');
  const justUnlocked = unlockState.phase === 'unlocked';
  const unlocked = Boolean(unlock) || justUnlocked;
  const unlockedAt = unlock?.unlocked_at ?? (justUnlocked ? unlockState.unlockedAt : null);
  // Die Inszenierung startet erst nach der Server-Bestätigung — und nur für eine neue
  // Prägung; meldet der Server „schon erwandert", wechselt nur der Status.
  const freshUnlock = justUnlocked && unlockState.fresh;
  const [momentDismissed, setMomentDismissed] = useState(false);
  const momentOpen = freshUnlock && !momentDismissed;
  // Der Prägeknopf erscheint erst, wenn feststeht, ob der Ort schon erwandert ist —
  // sonst blitzt er bei bereits geprägten Schildern kurz auf.
  const showFooter = !unlocked && !unlocks.isPending;
  const [footerH, setFooterH] = useState(0);

  const stageH = Math.min(460, height * 0.52);
  const badgeWidth = Math.min(210, width * 0.52);

  // Das Schild dreht sich leicht mit der Handyneigung — wie Messing im Licht.
  const badgeTilt = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateY: `${tilt.value.x * 9}deg` },
      { rotateX: `${-tilt.value.y * 7}deg` },
    ],
  }));
  const stageParallax = useAnimatedStyle(() => ({
    transform: [
      { translateY: Math.min(0, scrollY.value) * -0.5 + Math.max(0, scrollY.value) * 0.35 },
    ],
  }));

  const back = (
    <IconButton
      glyph="chevronLeft"
      accessibilityLabel={de.allgemein.zurueck}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/orte'))}
    />
  );

  if (!place) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.xxl }]}>
        <StateView
          loading={places.isPending}
          glyph="compass"
          message={places.isPending ? de.orte.laden : de.detail.nichtGefunden}
        />
        <View style={[styles.floatingBack, { top: insets.top + spacing.sm }]}>{back}</View>
      </View>
    );
  }

  const distanceM = here ? haversineM(here.lat, here.lng, place.lat, place.lng) : null;

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: showFooter ? footerH + spacing.lg : insets.bottom + spacing.xl,
        }}
      >
        {/* Bühne: Nacht-Panel der Website (badges.js .bm-art) mit Bergkette und Sternen */}
        <Animated.View style={[styles.stage, { height: stageH }, stageParallax]}>
          <LinearGradient
            colors={[colors.artPanelFrom, colors.artPanelTo]}
            start={{ x: 0.3, y: 0.1 }}
            end={{ x: 0.7, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Stars width={width} height={stageH * 0.6} count={18} />
          <Glow
            size={width * 1.1}
            x={width / 2}
            y={stageH * 0.48}
            color={unlocked ? landscape.moonGlow : landscape.nightFog}
            opacity={unlocked ? 0.55 : 0.4}
          />
          <View style={[styles.stageRanges, { height: stageH * 0.5 }]}>
            <Ranges
              width={width}
              height={stageH * 0.5}
              palette="night"
              layers={[2, 3, 4, 5]}
              restScale={0.4}
              intro="rise"
            />
          </View>
          <View style={[styles.badgeSlot, { paddingTop: insets.top + spacing.lg }]}>
            <Animated.View style={badgeTilt}>
              <BadgeArt place={place} width={badgeWidth} locked={!unlocked} night />
            </Animated.View>
          </View>
        </Animated.View>

        <View style={styles.sheet}>
          <Animated.Text entering={FadeInDown.delay(60).springify()} style={styles.eyebrow}>
            {place.region} · {formatCoords(place.lat, place.lng)}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(120).springify()} style={styles.name}>
            {place.name}
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.chips}>
            <MetaChip glyph="mountain" label={`${place.elevation_m} m`} />
            <MetaChip glyph="signpost" label={place.type} />
            {distanceM != null && (
              <MetaChip glyph="route" label={de.karte.entfernt(formatDistance(distanceM))} />
            )}
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(240).springify()} style={styles.desc}>
            {place.description}
          </Animated.Text>

          <View style={styles.statusRow}>
            <StatusMark
              unlocked={unlocked}
              lines={2}
              label={
                unlockedAt
                  ? de.detail.erwandertAm(formatDateDe(unlockedAt))
                  : unlocked
                    ? de.detail.erwandertOhneDatum
                    : de.karte.sheetVerschlossen
              }
            />
          </View>

          {/* Shop-Teaser: sichtbar, aber deaktiviert (verbindliche Entscheidung) */}
          <View
            style={styles.shop}
            accessibilityState={{ disabled: true }}
            accessible
            accessibilityLabel={de.detail.shopTeaser}
          >
            <Glyph name="emboss" size={18} color={colors.inkSoft} strokeWidth={1.5} />
            <Text style={styles.shopText}>{de.detail.shopTeaserKurz}</Text>
            <View style={styles.soon}>
              <Text style={styles.soonText}>{de.detail.bald}</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {showFooter && (
        <GlassSurface
          radius={0}
          style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
          intensity={45}
          onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
        >
          <UnlockSection
            state={unlockState}
            onStart={startUnlock}
            radiusM={place.unlock_radius_m}
          />
        </GlassSurface>
      )}

      <CompactHeader title={place.name} scrollY={scrollY} left={back} threshold={stageH - 90} />

      {freshUnlock && (
        <PraegeMoment
          place={place}
          unlockedAt={unlockedAt}
          visible={momentOpen}
          onDone={() => setMomentDismissed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  floatingBack: {
    position: 'absolute',
    left: spacing.md,
  },
  stage: {
    overflow: 'hidden',
    backgroundColor: colors.artPanelTo,
  },
  stageRanges: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  badgeSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    marginTop: -radius.sheet,
    borderTopLeftRadius: radius.sheet + 4,
    borderTopRightRadius: radius.sheet + 4,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  eyebrow: {
    ...textStyles.eyebrow,
    fontSize: 10.5,
    letterSpacing: 1.6,
  },
  name: {
    ...textStyles.title,
    fontFamily: fonts.displayMedium,
    fontSize: 46,
    lineHeight: 49,
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    maxWidth: '100%',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.paperLine,
    backgroundColor: colors.paperDeep,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 4,
  },
  chipText: {
    flexShrink: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  desc: {
    ...textStyles.body,
    marginTop: spacing.lg,
  },
  statusRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.paperLine,
  },
  shop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.paperLine,
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    opacity: 0.85,
  },
  shopText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.inkSoft,
  },
  soon: {
    borderRadius: radius.pill,
    backgroundColor: colors.paperLine,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  soonText: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
});
