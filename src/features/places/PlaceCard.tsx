import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BadgeArt } from '@/badges';
import { Glyph } from '@/components/Glyph';
import { PressableScale } from '@/components/PressableScale';
import { StatusMark } from '@/components/StatusMark';
import { de } from '@/i18n/de';
import { motionSprings, staggerDelay } from '@/lib/motion';
import type { Place } from '@/lib/places';
import { colors, fonts, glass, shadows, spacing } from '@/theme';

type Props = {
  place: Place;
  unlocked: boolean;
  index: number;
};

/** Listenkarte eines Ortes (Orte-Tab): Schild mit Glanz bzw. Nebel, Name, Höhe, Zustand. */
export function PlaceCard({ place, unlocked, index }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(staggerDelay(index))
        .springify()
        .damping(motionSprings.sheet.damping)}
    >
      <PressableScale
        onPress={() => router.push({ pathname: '/ort/[id]', params: { id: place.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${place.name}, ${unlocked ? de.orte.statusErwandert : de.orte.statusVerschlossen}`}
        tilt={3}
        style={styles.card}
      >
        <BadgeArt place={place} width={62} locked={!unlocked} sheen={false} fogMotion={false} />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {place.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            <Text style={styles.elevation}>{place.elevation_m} m</Text>
            {' · '}
            {place.type}
          </Text>
          <View style={styles.status}>
            <StatusMark
              unlocked={unlocked}
              label={unlocked ? de.orte.statusErwandert : de.orte.statusKurzNebel}
            />
          </View>
        </View>
        <Glyph name="chevronRight" size={18} color={colors.inkSoft} style={styles.chevron} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: glass.paperFillStrong,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: glass.paperBorder,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    boxShadow: shadows.card,
  },
  body: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 23,
    lineHeight: 27,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 3,
  },
  elevation: {
    fontFamily: fonts.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: colors.brassDeep,
  },
  status: {
    marginTop: spacing.sm,
  },
  chevron: {
    opacity: 0.5,
  },
});
