import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
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

import { StockBadge } from '@/badges';
import { Eyebrow } from '@/components/Eyebrow';
import { progressLabel, progressSub } from '@/features/collection/progress';
import { usePlaces, useRefreshPlaces, useUnlocks } from '@/features/places/queries';
import { de } from '@/i18n/de';
import { formatDateDe } from '@/lib/format';
import type { Place } from '@/lib/places';
import type { Unlock } from '@/lib/unlocks';
import { colors, fonts, spacing, textStyles } from '@/theme';

/** Sammlung — Pine-Welt nach Website `.collection`/`.coll-grid` (A-AP7-1: Grid statt Stock-Szene). */
export default function SammlungScreen() {
  const insets = useSafeAreaInsets();
  const places = usePlaces();
  const unlocks = useUnlocks();
  const refresh = useRefreshPlaces();
  const [refreshing, setRefreshing] = useState(false);

  const unlockByPlace = useMemo(() => {
    const map = new Map<string, Unlock>();
    (unlocks.data ?? []).forEach((u) => map.set(u.place_id, u));
    return map;
  }, [unlocks.data]);

  const all = places.data ?? [];
  const unlockedCount = all.filter((p) => unlockByPlace.has(p.id)).length;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Place }) => {
    const unlock = unlockByPlace.get(item.id);
    const unlocked = Boolean(unlock);
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/ort/[id]', params: { id: item.id } })}
        accessibilityRole="button"
        accessibilityLabel={unlocked ? item.name : de.sammlung.verschlossen}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <StockBadge
          name={item.name}
          region={item.region}
          elevationM={item.elevation_m}
          motif={item.badge_motif}
          shape={item.badge_shape}
          tone={item.badge_tone}
          locked={!unlocked}
          width={140}
        />
        <Text style={[styles.cardName, !unlocked && styles.cardNameLocked]}>
          {unlocked ? item.name : de.sammlung.verschlossen}
        </Text>
        <Text style={styles.cardSub}>
          {unlock ? formatDateDe(unlock.unlocked_at) : de.sammlung.nochNicht}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.headerRow}>
        <Eyebrow onPine>{de.sammlung.eyebrow}</Eyebrow>
        <Pressable
          onPress={() => router.push('/einstellungen')}
          accessibilityRole="button"
          accessibilityLabel={de.einstellungen.titel}
          style={styles.gear}
        >
          <Feather name="settings" size={18} color={colors.paperOnPineDim} />
        </Pressable>
      </View>
      <Text style={styles.title}>{de.sammlung.title}</Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{progressLabel(unlockedCount, all.length)}</Text>
        <Text style={styles.progressSub}>{progressSub(unlockedCount, all.length)}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.bar,
            { width: `${all.length === 0 ? 0 : (unlockedCount / all.length) * 100}%` },
          ]}
        />
      </View>

      {places.isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brassLight} />
          <Text style={styles.stateText}>{de.sammlung.laden}</Text>
        </View>
      ) : places.isError && all.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.stateText}>{de.sammlung.fehler}</Text>
          <Pressable onPress={() => refresh()} accessibilityRole="button" style={styles.retry}>
            <Text style={styles.retryText}>{de.orte.nochmal}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={all}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brassLight}
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
    backgroundColor: colors.pine,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gear: {
    padding: spacing.xs,
  },
  title: {
    ...textStyles.title,
    color: colors.paperOnPine,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressLabel: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.brassLight,
  },
  progressSub: {
    flexShrink: 1,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.leadOnPine,
    textAlign: 'right',
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.pineSoft,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.brass,
    borderRadius: 2,
  },
  grid: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardName: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 21,
    color: colors.paperOnPine,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cardNameLocked: {
    color: colors.paperOnPineDim,
  },
  cardSub: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.paperOnPineDim,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  center: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  stateText: {
    ...textStyles.body,
    color: colors.leadOnPine,
    textAlign: 'center',
  },
  retry: {
    borderWidth: 1,
    borderColor: colors.paperOnPine,
    borderRadius: 40,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.paperOnPine,
  },
});
