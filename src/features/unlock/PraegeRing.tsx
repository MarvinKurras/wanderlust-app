import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors } from '@/theme';

/**
 * Expandierender Brass-Ring beim Prägen — Port der `karte.html`-Keyframes
 * `ring` (Scale .5→2.4, Opacity .7→0, ~800 ms ease-out).
 */
export function PraegeRing({ size }: { size: number }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.4] }) },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.brassLight,
  },
});
