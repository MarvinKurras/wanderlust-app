import { useId } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import type { Place } from '@/lib/places';
import { colors, shadows } from '@/theme';

import { BrassSheen } from './BrassSheen';
import { FogVeil } from './FogVeil';
import { VIEWBOX } from './geometry';
import { StockBadge } from './StockBadge';

type Props = {
  place: Pick<
    Place,
    'name' | 'region' | 'elevation_m' | 'badge_motif' | 'badge_shape' | 'badge_tone'
  >;
  width: number;
  locked: boolean;
  /** Messingglanz auf erwanderten Schildern (A-D-5). */
  sheen?: boolean;
  /** Nebelschwaden auf verschlossenen Schildern. */
  fog?: boolean;
  /** `false` lässt den Nebel stillstehen (kleine Schilder in Listen und Karussell). */
  fogMotion?: boolean;
  /** Dunkler Nebel für die Tannen-Nacht. */
  night?: boolean;
  bandLabel?: string;
};

/**
 * Website-Schlagschatten der Schilder (`badges.js` feDropShadow: dy 2,
 * stdDeviation 2.4, ink .4) — folgt der Schildform statt eines Rechtecks:
 * iOS über den Ebenenschatten (ohne Hintergrund folgt er dem Inhalt),
 * Android/Web über den CSS-Filter `drop-shadow`. Löst A-AP2-1 ein.
 */
const dropShadow: ViewStyle =
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.ink,
      shadowOpacity: 0.4,
      shadowRadius: 2.4,
      shadowOffset: { width: 0, height: 2 },
    },
    default: { filter: shadows.badgeDrop },
  }) ?? {};

/**
 * Ein Stockschild mit Inszenierung (AP-D): das pixel-treue `StockBadge`,
 * darüber Messingglanz (frei) oder Nebel (verschlossen), dazu der Schatten.
 */
export function BadgeArt({
  place,
  width,
  locked,
  sheen = true,
  fog = true,
  fogMotion = true,
  night = false,
  bandLabel,
}: Props) {
  const uid = `a${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const height = (width * VIEWBOX.height) / VIEWBOX.width;
  return (
    <View style={[{ width, height }, styles.wrap]}>
      <View style={dropShadow}>
        <StockBadge
          name={place.name}
          region={place.region}
          elevationM={place.elevation_m}
          motif={place.badge_motif}
          shape={place.badge_shape}
          tone={place.badge_tone}
          locked={locked}
          bandLabel={bandLabel}
          width={width}
        />
      </View>
      {!locked && sheen && <BrassSheen shape={place.badge_shape} width={width} uid={uid} />}
      {locked && fog && (
        <FogVeil width={width} height={height} uid={uid} night={night} animated={fogMotion} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
});
