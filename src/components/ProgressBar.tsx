import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motionEasings } from '@/lib/motion';
import { badgeTones, colors } from '@/theme';

type Props = {
  /** 0–1 */
  value: number;
  tone?: 'paper' | 'pine';
  height?: number;
  delay?: number;
};

/** Messing-Fortschritt: füllt sich beim Erscheinen wie gegossenes Metall. */
export function ProgressBar({ value, tone = 'paper', height = 4, delay = 250 }: Props) {
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const fill = useSharedValue(reducedMotion ? value : 0);

  useEffect(() => {
    fill.value = reducedMotion
      ? value
      : withDelay(delay, withTiming(value, { duration: 1100, easing: motionEasings.reveal }));
  }, [value, delay, reducedMotion, fill]);

  const barStyle = useAnimatedStyle(() => ({
    width: Math.max(0, Math.min(1, fill.value)) * width,
  }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: tone === 'pine' ? colors.pineSoft : colors.paperLine,
        },
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <Animated.View style={[styles.bar, { borderRadius: height / 2 }, barStyle]}>
        <LinearGradient
          colors={[badgeTones.brass.lo, badgeTones.brass.mid, badgeTones.brass.hi]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    overflow: 'hidden',
  },
});
