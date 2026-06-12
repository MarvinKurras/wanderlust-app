import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow } from '@/components/Eyebrow';
import { regionProgress, regionProgressLabel } from '@/features/collection/regionProgress';
import { PlaceCard } from '@/features/places/PlaceCard';
import { usePlaces, useRefreshPlaces, useRegions, useUnlocks } from '@/features/places/queries';
import { buildPlaceSections } from '@/features/places/sections';
import { de } from '@/i18n/de';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

type Filter = 'alle' | 'offen' | 'erwandert';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'alle', label: de.orte.filterAlle },
  { key: 'offen', label: de.orte.filterOffen },
  { key: 'erwandert', label: de.orte.filterErwandert },
];

export default function OrteScreen() {
  const insets = useSafeAreaInsets();
  const places = usePlaces();
  const regions = useRegions();
  const unlocks = useUnlocks();
  const refresh = useRefreshPlaces();
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

  // Gruppierung nach Unterregion (AP-R2); Fortschritt immer über ALLE Orte der Region,
  // unabhängig vom aktiven Filter
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg }]}>
      <Eyebrow>{de.orte.eyebrow}</Eyebrow>
      <Text style={styles.title}>{de.orte.title}</Text>

      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            accessibilityRole="button"
            style={[styles.chip, filter === key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {places.isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brassDeep} />
          <Text style={styles.stateText}>{de.orte.laden}</Text>
        </View>
      ) : places.isError ? (
        <View style={styles.center}>
          <Text style={styles.stateText}>{de.orte.fehler}</Text>
          <Pressable onPress={() => refresh()} accessibilityRole="button" style={styles.retry}>
            <Text style={styles.retryText}>{de.orte.nochmal}</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PlaceCard place={item} unlocked={unlockedIds.has(item.id)} />}
          renderSectionHeader={({ section }) => {
            const progress = section.regionId ? progressByRegion.get(section.regionId) : undefined;
            return (
              <View style={styles.sectionHeader}>
                {section.parentTitle && (
                  <Text style={styles.sectionParent}>{section.parentTitle}</Text>
                )}
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {progress && (
                  <Text style={[styles.sectionProgress, progress.complete && styles.sectionComplete]}>
                    {progress.complete ? de.regionen.komplett : regionProgressLabel(progress)}
                  </Text>
                )}
              </View>
            );
          }}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<Text style={styles.stateText}>{de.orte.leer}</Text>}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...textStyles.title,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.paper,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionParent: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.brassDeep,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 24,
    color: colors.ink,
  },
  sectionProgress: {
    marginTop: spacing.xs,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  sectionComplete: {
    color: colors.brassDeep,
  },
  center: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  stateText: {
    ...textStyles.body,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  retry: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.ink,
  },
});
