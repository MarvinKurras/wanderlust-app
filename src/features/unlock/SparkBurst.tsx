import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { badgeTones, shadows } from '@/theme';

type Props = {
  /** Jede Änderung löst einen neuen Funkenflug aus (z. B. Schlag-Nummer). */
  burst: number;
  /** Radius des Funkenflugs (px) */
  reach: number;
  count?: number;
};

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COLORS = [badgeTones.brass.hi, badgeTones.brass.mid, badgeTones.copper.hi];

function Spark({
  progress,
  angle,
  distance,
  size,
  color,
}: {
  progress: SharedValue<number>;
  angle: number;
  distance: number;
  size: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p <= 0 ? 0 : 1 - p,
      transform: [
        { translateX: Math.cos(angle) * distance * p },
        // leichte Schwerkraft: Funken sinken am Ende ab
        { translateY: Math.sin(angle) * distance * p + 40 * p * p },
        { scale: 1 - p * 0.6 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.spark,
        { width: size, height: size, borderRadius: size, backgroundColor: color },
        style,
      ]}
    />
  );
}

/** Messingfunken beim Hammerschlag — fliegen radial aus und verglühen. */
export function SparkBurst({ burst, reach, count = 16 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (burst <= 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [burst, progress]);

  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + pseudoRandom(i + burst * 7) * 0.5,
        distance: reach * (0.55 + pseudoRandom(i + 11 + burst) * 0.6),
        size: 2.5 + pseudoRandom(i + 23) * 3.5,
        color: COLORS[i % COLORS.length],
      })),
    [count, reach, burst],
  );

  return (
    <View pointerEvents="none" style={styles.center}>
      {sparks.map((s, i) => (
        <Spark key={i} progress={progress} {...s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
  },
  spark: {
    position: 'absolute',
    boxShadow: shadows.spark,
  },
});
