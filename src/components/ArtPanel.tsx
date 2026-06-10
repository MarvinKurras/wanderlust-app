import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, radius, spacing } from '@/theme';

/**
 * Dunkles Bühnen-Panel hinter einem Badge — Website: badges.js .bm-art
 * `radial-gradient(120% 120% at 30% 18%, #33453a, #161e18)`.
 */
export function ArtPanel({ children }: PropsWithChildren) {
  return (
    <View style={styles.panel}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="artpanel" cx="30%" cy="18%" rx="120%" ry="120%">
            <Stop offset="0%" stopColor={colors.artPanelFrom} />
            <Stop offset="100%" stopColor={colors.artPanelTo} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#artpanel)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
});
