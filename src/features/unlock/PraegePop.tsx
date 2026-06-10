import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Pop-Animation der frischen Prägung — Port der `karte.html`-Keyframes
 * `pop` (Scale .4 → 1.12 → 1, ~700 ms).
 */
export function PraegePop({ children }: PropsWithChildren) {
  const [scale] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.12, duration: 420, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}
