import { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { motionEasings } from '@/lib/motion';
import { colors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const D = 'M4 9 C60 3 120 11 176 7 C232 3 280 9 316 6';
/** Länge des Strichs im 320er-viewBox (gemessen; für das Zeichnen per Dash-Offset). */
const LENGTH = 314;

/** Handgezogener Messingstrich unter der Wortmarke (Website `.word-underline`, zeichnet sich ein). */
export function SketchUnderline({ width, delay = 1550 }: { width: number; delay?: number }) {
  const reducedMotion = useReducedMotion();
  const draw = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    draw.value = withDelay(delay, withTiming(1, { duration: 1000, easing: motionEasings.draw }));
  }, [delay, reducedMotion, draw]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - draw.value) }));

  return (
    <Svg width={width} height={(width * 14) / 320} viewBox="0 0 320 14" fill="none">
      <AnimatedPath
        d={D}
        stroke={colors.brassDeep}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray={[LENGTH, LENGTH]}
        animatedProps={props}
      />
    </Svg>
  );
}
