import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BadgeArt } from '@/badges';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { StatusMark } from '@/components/StatusMark';
import { openDirections } from '@/features/map/directions';
import { de } from '@/i18n/de';
import { formatCoords, formatDateDe } from '@/lib/format';
import { formatDistance } from '@/lib/geo';
import type { Place } from '@/lib/places';
import type { Unlock } from '@/lib/unlocks';
import { colors, fonts, spacing, textStyles } from '@/theme';

type Props = {
  place: Place | null;
  visible: boolean;
  unlock: Unlock | undefined;
  /** Luftlinie vom eigenen Standort (m); null ohne Standortfreigabe. */
  distanceM: number | null;
  onClose: () => void;
};

/** Bottom Sheet eines Ortes auf der Karte (karte.html `.sheet`) — wischbar, Pergament. */
export function PlaceSheet({ place, visible, unlock, distanceM, onClose }: Props) {
  const unlocked = Boolean(unlock);

  return (
    <BottomSheet visible={visible && place != null} onClose={onClose}>
      {place && (
        <View>
          <View style={styles.row}>
            <BadgeArt place={place} width={100} locked={!unlocked} />
            <View style={styles.info}>
              <Text style={styles.eyebrow} numberOfLines={2}>
                {place.region} · {formatCoords(place.lat, place.lng)}
              </Text>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.meta}>
                <Text style={styles.elevation}>{place.elevation_m} m</Text>
                {' · '}
                {place.type}
              </Text>
              {distanceM != null && (
                <Text style={styles.distance}>{de.karte.entfernt(formatDistance(distanceM))}</Text>
              )}
              <View style={styles.status}>
                <StatusMark
                  unlocked={unlocked}
                  label={
                    unlock
                      ? de.detail.erwandertKurz(formatDateDe(unlock.unlocked_at))
                      : de.karte.sheetVerschlossen
                  }
                />
              </View>
            </View>
          </View>
          <View style={styles.ctaRow}>
            <Button
              label={de.karte.route}
              variant="outline"
              glyph="route"
              onPress={() => void openDirections(place)}
              accessibilityLabel={de.karte.routeLabel(place.name)}
            />
            <Button
              label={de.karte.sheetDetails}
              glyph="arrowRight"
              style={styles.cta}
              onPress={() => {
                onClose();
                router.push({ pathname: '/ort/[id]', params: { id: place.id } });
              }}
            />
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md + 2,
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  eyebrow: {
    ...textStyles.eyebrow,
    fontSize: 9.5,
    letterSpacing: 1.3,
  },
  name: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 30,
    lineHeight: 33,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.inkSoft,
    marginTop: 2,
  },
  elevation: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.brassDeep,
  },
  distance: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.brassDeep,
    marginTop: spacing.xs,
  },
  status: {
    marginTop: spacing.sm,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cta: {
    flex: 1,
  },
});
