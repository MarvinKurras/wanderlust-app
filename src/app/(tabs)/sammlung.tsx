import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { BadgeArt } from '@/badges';
import { Atmosphere } from '@/components/atmosphere/Atmosphere';
import { IconButton } from '@/components/IconButton';
import { PressableScale } from '@/components/PressableScale';
import { ProgressBar } from '@/components/ProgressBar';
import { FocusStatusBar } from '@/components/FocusStatusBar';
import { CompactHeader, LargeTitle, useCollapsingHeader } from '@/components/ScreenChrome';
import { StateView } from '@/components/StateView';
import { StatusMark } from '@/components/StatusMark';
import { useTabBarSpace } from '@/components/TabBar';
import { progressSub } from '@/features/collection/progress';
import { RegionBadge } from '@/features/collection/RegionBadge';
import { regionProgress, regionProgressLabel } from '@/features/collection/regionProgress';
import { usePlaces, useRefreshPlaces, useRegions, useUnlocks } from '@/features/places/queries';
import { de } from '@/i18n/de';
import { formatDateShort } from '@/lib/format';
import { motionSprings, staggerDelay } from '@/lib/motion';
import type { Place } from '@/lib/places';
import type { Unlock } from '@/lib/unlocks';
import { colors, fonts, spacing, textStyles } from '@/theme';

const GRID_GAP = spacing.md;
/** Etwa eine Bildschirmfüllung — so viele Schilder rendert das Raster sofort. */
const INITIAL_CARDS = 8;

/**
 * Sammlung — die Vitrine in der Tannen-Nacht (Website `.collection`/`.coll-grid`,
 * A-AP7-1: Grid statt Stock-Szene). Erwanderte Schilder glänzen und folgen der
 * Handyneigung; verschlossene liegen im Nachtnebel.
 */
export default function SammlungScreen() {
  const { width } = useWindowDimensions();
  const places = usePlaces();
  const regions = useRegions();
  const unlocks = useUnlocks();
  const refresh = useRefreshPlaces();
  const tabSpace = useTabBarSpace();
  const { scrollY, onScroll } = useCollapsingHeader();
  const [refreshing, setRefreshing] = useState(false);

  const unlockByPlace = useMemo(() => {
    const map = new Map<string, Unlock>();
    (unlocks.data ?? []).forEach((u) => map.set(u.place_id, u));
    return map;
  }, [unlocks.data]);

  // Erwanderte zuerst (jüngste oben), danach die Orte im Nebel
  const all = useMemo(() => {
    const list = [...(places.data ?? [])];
    return list.sort((a, b) => {
      const ua = unlockByPlace.get(a.id);
      const ub = unlockByPlace.get(b.id);
      if (ua && ub) return ub.unlocked_at.localeCompare(ua.unlocked_at);
      if (ua) return -1;
      if (ub) return 1;
      return 0;
    });
  }, [places.data, unlockByPlace]);
  const unlockedCount = all.filter((p) => unlockByPlace.has(p.id)).length;

  // Abschluss-Marken: alle Unterregionen mit Zielen (AP-R2)
  const regionRow = useMemo(() => {
    const progress = regionProgress(regions.data ?? [], all, unlocks.data ?? []);
    return [...progress.values()]
      .filter((p) => p.parentId !== null && p.total > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [regions.data, all, unlocks.data]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fehler zeigt die Liste selbst (StateView); hier nur das Ziehen beenden.
    await refresh().catch(() => undefined);
    setRefreshing(false);
  };

  const cardWidth = (width - spacing.lg * 2 - GRID_GAP) / 2;
  const badgeWidth = Math.min(150, cardWidth - spacing.lg);

  const settings = (
    <IconButton
      glyph="sliders"
      tone="pine"
      size={40}
      accessibilityLabel={de.einstellungen.titel}
      onPress={() => router.push('/einstellungen')}
    />
  );

  const renderCard = ({ item, index }: { item: Place; index: number }) => {
    const unlock = unlockByPlace.get(item.id);
    const unlocked = Boolean(unlock);
    return (
      <Animated.View
        // Nur die erste Bildschirmfüllung staffelt herein; später nachgeladene
        // Zeilen (Virtualisierung) erscheinen ohne Verzögerung.
        entering={
          index < INITIAL_CARDS
            ? FadeInDown.delay(300 + staggerDelay(index, 12))
                .springify()
                .damping(motionSprings.sheet.damping)
            : undefined
        }
        style={{ width: cardWidth }}
      >
        <PressableScale
          onPress={() => router.push({ pathname: '/ort/[id]', params: { id: item.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${unlocked ? de.orte.statusErwandert : de.orte.statusVerschlossen}`}
          tilt={6}
          style={styles.card}
        >
          <BadgeArt place={item} width={badgeWidth} locked={!unlocked} night />
          <Text style={[styles.cardName, !unlocked && styles.cardNameLocked]} numberOfLines={2}>
            {item.name}
          </Text>
          {unlock ? (
            <Text style={styles.cardDate}>{formatDateShort(unlock.unlocked_at)}</Text>
          ) : (
            <View style={styles.cardMark}>
              <StatusMark unlocked={false} label={de.orte.statusKurzNebel} tone="pine" size="sm" />
            </View>
          )}
        </PressableScale>
      </Animated.View>
    );
  };

  const header = (
    <>
      <LargeTitle
        eyebrow={de.sammlung.eyebrow}
        title={de.sammlung.title}
        scrollY={scrollY}
        tone="pine"
      />

      <Animated.View entering={FadeIn.delay(120)} style={styles.progress}>
        <View style={styles.counterRow}>
          <Text style={styles.counter}>{unlockedCount}</Text>
          <Text style={styles.counterOf}>/ {all.length}</Text>
          <Text style={styles.counterLabel}>{de.sammlung.erwandert}</Text>
        </View>
        <ProgressBar
          value={all.length ? unlockedCount / all.length : 0}
          tone="pine"
          height={4}
          delay={400}
        />
        <Text style={styles.progressSub}>{progressSub(unlockedCount, all.length)}</Text>
      </Animated.View>

      {regionRow.length > 0 && (
        <View style={styles.regionBlock}>
          <Text style={styles.blockEyebrow}>{de.regionen.sammlungEyebrow}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.regionRow}
          >
            {regionRow.map((p) => (
              <View
                key={p.regionId}
                style={styles.regionItem}
                accessible
                accessibilityLabel={regionProgressLabel(p)}
              >
                <RegionBadge progress={p} width={78} />
                <Text style={styles.regionName}>{p.name}</Text>
                <Text style={[styles.regionLabel, p.complete && styles.regionDone]}>
                  {p.complete ? de.regionen.komplettKurz : `${p.unlocked} / ${p.total}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.blockEyebrow, styles.gridEyebrow]}>{de.sammlung.schilder}</Text>
    </>
  );

  const empty = places.isPending ? (
    <StateView loading message={de.sammlung.laden} tone="pine" />
  ) : places.isError ? (
    <StateView
      message={de.sammlung.fehler}
      actionLabel={de.orte.nochmal}
      onAction={() => refresh()}
      tone="pine"
    />
  ) : null;

  return (
    <View style={styles.screen}>
      <FocusStatusBar style="light" />
      <Atmosphere variant="pine" />
      {/* Virtualisiertes Raster: nur sichtbare Schilder (mit Nebel/Glanz) sind gemountet. */}
      <Animated.FlatList
        data={all}
        keyExtractor={(p) => p.id}
        numColumns={2}
        renderItem={renderCard}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        columnWrapperStyle={styles.gridRow}
        ItemSeparatorComponent={RowGap}
        initialNumToRender={INITIAL_CARDS}
        windowSize={5}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: tabSpace + spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brassLight}
            colors={[colors.brassDeep]}
          />
        }
      />
      <CompactHeader
        title={de.sammlung.title}
        scrollY={scrollY}
        tone="pine"
        right={settings}
        threshold={70}
      />
    </View>
  );
}

function RowGap() {
  return <View style={styles.rowGap} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pine,
  },
  progress: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  counter: {
    ...textStyles.numeral,
    color: colors.brassLight,
  },
  counterOf: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.paperOnPineDim,
  },
  counterLabel: {
    marginLeft: 'auto',
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.brassLight,
  },
  progressSub: {
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    color: colors.leadOnPine,
    marginTop: spacing.xs,
  },
  regionBlock: {
    marginTop: spacing.xl,
  },
  blockEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.brassLight,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  regionRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  regionItem: {
    alignItems: 'center',
    width: 96,
  },
  regionName: {
    marginTop: spacing.sm,
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    color: colors.paperOnPine,
    textAlign: 'center',
  },
  regionLabel: {
    marginTop: 2,
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.paperOnPineDim,
  },
  regionDone: {
    color: colors.brassLight,
  },
  gridEyebrow: {
    marginTop: spacing.xl,
  },
  gridRow: {
    gap: GRID_GAP,
    paddingHorizontal: spacing.lg,
  },
  rowGap: {
    height: spacing.lg,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cardName: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    lineHeight: 23,
    color: colors.paperOnPine,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cardNameLocked: {
    color: colors.paperOnPineDim,
  },
  cardDate: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.brassLight,
    marginTop: spacing.xs,
  },
  cardMark: {
    marginTop: spacing.xs,
  },
});
