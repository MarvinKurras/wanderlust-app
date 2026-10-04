import { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Atmosphere } from '@/components/atmosphere/Atmosphere';
import { ProgressBar } from '@/components/ProgressBar';
import { CompactHeader, LargeTitle, useCollapsingHeader } from '@/components/ScreenChrome';
import { Segmented } from '@/components/Segmented';
import { StateView } from '@/components/StateView';
import { StatusMark } from '@/components/StatusMark';
import { useTabBarSpace } from '@/components/TabBar';
import { regionProgress, regionProgressLabel } from '@/features/collection/regionProgress';
import { PlaceCard } from '@/features/places/PlaceCard';
import { usePlaces, useRefreshPlaces, useRegions, useUnlocks } from '@/features/places/queries';
import { buildPlaceSections, type PlaceSection } from '@/features/places/sections';
import { de } from '@/i18n/de';
import type { Place } from '@/lib/places';
import { colors, fonts, spacing } from '@/theme';

type Filter = 'alle' | 'offen' | 'erwandert';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'alle', label: de.orte.filterAlle },
  { key: 'offen', label: de.orte.filterOffen },
  { key: 'erwandert', label: de.orte.filterErwandert },
];

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<Place, PlaceSection>);

export default function OrteScreen() {
  const places = usePlaces();
  const regions = useRegions();
  const unlocks = useUnlocks();
  const refresh = useRefreshPlaces();
  const tabSpace = useTabBarSpace();
  const { scrollY, onScroll } = useCollapsingHeader();
  const [filter, setFilter] = useState<Filter>('alle');
  const [refreshing, setRefreshing] = useState(false);

  const unlockedIds = useMemo(
    () => new Set((unlocks.data ?? []).map((u) => u.place_id)),
    [unlocks.data],
  );

  const visible = useMemo(() => {
    const all = places.data ?? [];
    if (filter === 'offen') return all.filter((p) => !unlockedIds.has(p.id));
    if (filter === 'erwandert') return all.filter((p) => unlockedIds.has(p.id));
    return all;
  }, [places.data, filter, unlockedIds]);

  // Gruppierung nach Unterregion (AP-R2); Fortschritt immer über ALLE Orte der Region
  const sections = useMemo(
    () => buildPlaceSections(visible, regions.data ?? [], de.regionen.weitereZiele),
    [visible, regions.data],
  );
  const progressByRegion = useMemo(
    () => regionProgress(regions.data ?? [], places.data ?? [], unlocks.data ?? []),
    [regions.data, places.data, unlocks.data],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const header = (
    <LargeTitle eyebrow={de.orte.eyebrow} title={de.orte.title} scrollY={scrollY} flush>
      <View style={styles.filter}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
      </View>
    </LargeTitle>
  );

  return (
    <View style={styles.screen}>
      <Atmosphere variant="paper" scrollY={scrollY} />
      {places.isPending ? (
        <View style={styles.fill}>
          {header}
          <StateView loading message={de.orte.laden} />
        </View>
      ) : places.isError ? (
        <View style={styles.fill}>
          {header}
          <StateView
            glyph="compass"
            message={de.orte.fehler}
            actionLabel={de.orte.nochmal}
            onAction={() => refresh()}
          />
        </View>
      ) : (
        <AnimatedSectionList
          sections={sections}
          keyExtractor={(p) => p.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <PlaceCard place={item} unlocked={unlockedIds.has(item.id)} index={index} />
          )}
          renderSectionHeader={({ section }) => {
            const progress = section.regionId ? progressByRegion.get(section.regionId) : undefined;
            return (
              <View style={styles.sectionHeader}>
                {section.parentTitle && (
                  <Text style={styles.sectionParent}>{section.parentTitle}</Text>
                )}
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {progress ? (
                    progress.complete ? (
                      <StatusMark unlocked label={de.regionen.komplettKurz} />
                    ) : (
                      <Text
                        style={styles.sectionCount}
                        accessibilityLabel={regionProgressLabel(progress)}
                      >
                        {progress.unlocked} / {progress.total}
                      </Text>
                    )
                  ) : (
                    <Text style={styles.sectionCount}>{de.orte.anzahl(section.data.length)}</Text>
                  )}
                </View>
                {progress && (
                  <View style={styles.sectionBar}>
                    <ProgressBar
                      value={progress.total ? progress.unlocked / progress.total : 0}
                      height={3}
                    />
                  </View>
                )}
              </View>
            );
          }}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[styles.list, { paddingBottom: tabSpace + spacing.md }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm + 2 }} />}
          ListEmptyComponent={<StateView glyph="signpost" message={de.orte.leer} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brassDeep}
              colors={[colors.brassDeep]}
            />
          }
        />
      )}
      <CompactHeader title={de.orte.title} scrollY={scrollY} threshold={70} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  filter: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionParent: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.brassDeep,
    marginBottom: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: fonts.displayMedium,
    fontSize: 28,
    lineHeight: 32,
    color: colors.ink,
  },
  sectionCount: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.inkSoft,
  },
  sectionBar: {
    marginTop: spacing.sm,
  },
});
