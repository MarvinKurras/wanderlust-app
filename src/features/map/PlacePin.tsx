import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { StockBadge } from '@/badges';
import { de } from '@/i18n/de';
import type { Place } from '@/lib/places';
import { badgeTones, colors, fonts, spacing } from '@/theme';

type Props = {
  place: Place;
  unlocked: boolean;
};

/**
 * Pin-Inhalt eines Ortes auf der Karte.
 * Frei: Mini-Stockschild mit Stiel und Brass-Punkt (karte.html `.pin`).
 * Gesperrt: Nebel-Schleier mit Schloss und „? ? ?" (karte.html `.fog`/`.label-q`).
 */
export function PlacePin({ place, unlocked }: Props) {
  if (!unlocked) {
    return (
      <View style={styles.fogWrap}>
        <Svg width={92} height={76}>
          <Defs>
            <RadialGradient id={`fog_${place.id}`} cx="50%" cy="46%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={colors.fogInner} stopOpacity={0.98} />
              <Stop offset="38%" stopColor={colors.fogMid} stopOpacity={0.9} />
              <Stop offset="60%" stopColor={colors.fogOuter} stopOpacity={0.45} />
              <Stop offset="74%" stopColor={colors.fogOuter} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={46} cy={35} rx={46} ry={35} fill={`url(#fog_${place.id})`} />
        </Svg>
        <View style={styles.lock}>
          <Feather name="lock" size={16} color={colors.inkSoft} />
        </View>
        <Text style={styles.fogLabel}>{de.karte.fogLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.pin}>
      <StockBadge
        name={place.name}
        region={place.region}
        elevationM={place.elevation_m}
        motif={place.badge_motif}
        shape={place.badge_shape}
        tone={place.badge_tone}
        width={49}
      />
      <View style={styles.stem} />
      {/* Brass-Punkt mit Radial-Verlauf (karte.html .pin .dot) */}
      <Svg width={9} height={9} style={styles.dot}>
        <Defs>
          <RadialGradient id={`dot_${place.id}`} cx="35%" cy="30%" r="80%">
            <Stop offset="0%" stopColor={badgeTones.brass.hi} />
            <Stop offset="60%" stopColor={colors.brass} />
            <Stop offset="100%" stopColor={colors.brassDeep} />
          </RadialGradient>
        </Defs>
        <Circle cx={4.5} cy={4.5} r={4.5} fill={`url(#dot_${place.id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
  },
  stem: {
    width: 2,
    height: 9,
    marginTop: -2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.stemDark,
  },
  dot: {
    marginTop: -1,
  },
  fogWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: {
    position: 'absolute',
    top: 22,
  },
  fogLabel: {
    marginTop: -spacing.sm,
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.inkSoft,
    opacity: 0.72,
  },
});
