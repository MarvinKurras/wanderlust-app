import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

/**
 * Expandierender Messingring beim Prägen — Port der `karte.html`-Keyframes
 * `ring` (Scale .5→2.4, Opacity .7→0, ~800 ms ease-out). Jede Änderung von
 * `pulse` schickt eine neue Welle los (ein Ring je Hammerschlag).
 */
export function PraegeRing({ size, pulse }: { size: number; pulse: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (pulse <= 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
  }, [pulse, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value <= 0 ? 0 : 0.7 * (1 - progress.value),
    transform: [{ scale: 0.5 + progress.value * 1.9 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: -size / 2,
          marginTop: -size / 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    borderWidth: 2,
    borderColor: colors.brassLight,
  },
});
