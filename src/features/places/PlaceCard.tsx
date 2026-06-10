import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StockBadge } from '@/badges';
import { de } from '@/i18n/de';
import type { Place } from '@/lib/places';
import { colors, fonts, radius, spacing } from '@/theme';

type Props = {
  place: Place;
  unlocked: boolean;
};

/** Listenkarte eines Ortes (Orte-Tab). */
export function PlaceCard({ place, unlocked }: Props) {
  return (
    <Link href={{ pathname: '/ort/[id]', params: { id: place.id } }} asChild>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={place.name}
      >
        <View style={styles.art}>
          <StockBadge
            name={place.name}
            region={place.region}
            elevationM={place.elevation_m}
            motif={place.badge_motif}
            shape={place.badge_shape}
            tone={place.badge_tone}
            locked={!unlocked}
            width={64}
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.meta}>
            {place.elevation_m} m · {place.region}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.pip, unlocked ? styles.pipDone : styles.pipLocked]} />
            <Text style={[styles.status, unlocked && styles.statusDone]}>
              {unlocked ? de.orte.statusErwandert : de.orte.statusVerschlossen}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paperDeep,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.paperLine,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.85,
  },
  art: {
    width: 64,
  },
  body: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.displayMedium,
    fontSize: 24,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkSoft,
    marginTop: spacing.xs,
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
    backgroundColor: colors.paperLine,
  },
  status: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  statusDone: {
    color: colors.brassDeep,
  },
});
