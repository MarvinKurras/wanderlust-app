import type { ReactNode } from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { tick } from '@/lib/haptics';
import { motionSprings } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Zielgröße beim Drücken. */
  scaleTo?: number;
  /** Kippt in Richtung des Fingers (Grad am Rand). 0 = aus. */
  tilt?: number;
  /** Leichte Haptik beim Auslösen. */
  haptic?: boolean;
};

/**
 * Pressable mit federndem Druckgefühl (Muster aus der Spielesammlung): schnell
 * rein, mit leichtem Nachschwingen zurück; optional kippt die Fläche
 * perspektivisch zum Berührungspunkt — wie ein Schild, das man anfasst.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.965,
  tilt = 0,
  haptic = true,
  onPress,
  onPressIn,
  onPressOut,
  onLayout,
  ...rest
}: Props) {
  const pressed = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const size = useSharedValue({ width: 1, height: 1 });

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 - (1 - scaleTo) * pressed.value;
    if (tilt === 0) {
      return { transform: [{ scale }] };
    }
    return {
      transform: [
        { perspective: 700 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale },
      ],
    };
  });

  const handlePressIn = (event: GestureResponderEvent) => {
    pressed.value = withSpring(1, motionSprings.press);
    if (tilt !== 0) {
      const { locationX, locationY } = event.nativeEvent;
      const nx = (locationX / size.value.width) * 2 - 1;
      const ny = (locationY / size.value.height) * 2 - 1;
      rotateY.value = withSpring(nx * tilt, motionSprings.press);
      rotateX.value = withSpring(-ny * tilt, motionSprings.press);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    pressed.value = withSpring(0, motionSprings.release);
    if (tilt !== 0) {
      rotateX.value = withSpring(0, motionSprings.release);
      rotateY.value = withSpring(0, motionSprings.release);
    }
    onPressOut?.(event);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    size.value = { width: Math.max(1, width), height: Math.max(1, height) };
    onLayout?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      onLayout={handleLayout}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={(event) => {
        if (haptic) tick();
        onPress?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
