import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceCard } from '@/features/places/PlaceCard';
import { usePlaces, useRefreshPlaces, useUnlocks } from '@/features/places/queries';
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
      <Text style={styles.eyebrow}>{de.orte.eyebrow}</Text>
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
        <FlatList
          data={visible}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PlaceCard place={item} unlocked={unlockedIds.has(item.id)} />}
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
  eyebrow: {
    ...textStyles.eyebrow,
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
