import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StockBadge } from '@/badges';
import { de } from '@/i18n/de';
import { formatCoords, formatDateDe } from '@/lib/format';
import type { Place } from '@/lib/places';
import type { Unlock } from '@/lib/unlocks';
import { colors, fonts, radius, spacing, textStyles } from '@/theme';

type Props = {
  place: Place;
  unlock: Unlock | undefined;
  onClose: () => void;
};

/** Bottom Sheet eines Ortes auf der Karte (karte.html `.sheet`). */
export function PlaceSheet({ place, unlock, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const unlocked = Boolean(unlock);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Schließen" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.grabber} />
        <View style={styles.row}>
          <StockBadge
            name={place.name}
            region={place.region}
            elevationM={place.elevation_m}
            motif={place.badge_motif}
            shape={place.badge_shape}
            tone={place.badge_tone}
            locked={!unlocked}
            width={96}
          />
          <View style={styles.info}>
            <Text style={styles.eyebrow}>
              {place.region} · {formatCoords(place.lat, place.lng)}
            </Text>
            <Text style={styles.name}>{place.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{place.elevation_m} m</Text>
              <View style={styles.dot} />
              <Text style={styles.meta}>{place.type}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.pip, unlocked ? styles.pipDone : styles.pipLocked]} />
              <Text style={[styles.status, unlocked && styles.statusDone]} numberOfLines={2}>
                {unlock
                  ? de.detail.erwandertAm(formatDateDe(unlock.unlocked_at))
                  : de.orte.statusVerschlossen}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => {
            onClose();
            router.push({ pathname: '/ort/[id]', params: { id: place.id } });
          }}
          accessibilityRole="button"
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{de.karte.sheetDetails}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrim,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.paperLine,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  eyebrow: {
    ...textStyles.eyebrow,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 28,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brass,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  statusDone: {
    color: colors.brassDeep,
  },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.paper,
  },
});
