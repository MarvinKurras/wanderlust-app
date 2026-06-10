import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Pop-Animation der frischen Prägung — Port der `karte.html`-Keyframes
 * `pop`: Scale .4 → 1.12 → 1, translateY 8 → 0, Opacity 0 → 1,
 * ~700 ms mit Overshoot-Bezier cubic-bezier(.2,.9,.3,1.2).
 */
export function PraegePop({ children }: PropsWithChildren) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      easing: Easing.bezier(0.2, 0.9, 0.3, 1.2),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={{
        opacity: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
        transform: [
          { scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 1.12, 1] }) },
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
