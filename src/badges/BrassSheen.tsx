import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { BadgeShape } from '@/lib/places';
import { badgeTones } from '@/theme';

import { SHAPES, VIEWBOX } from './geometry';

export type BrassSheenProps = {
  shape: BadgeShape;
  width: number;
  /** Stärke 0–1 */
  intensity?: number;
  /** Eindeutige ID, wenn mehrere Schilder derselben Form auf einem Screen liegen. */
  uid: string;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BAND_W = 70;
const PAUSE_MS = 3200;

/**
 * Web-Fallback des Messingglanzes (nativ: Skia-Shader in `BrassSheen.native.tsx`):
 * ein Lichtstreif zieht in Abständen über das Schild — wie der Glanz-Sweep der
 * Website (`badges.js` glint), exakt auf die Schildform beschnitten.
 */
export function BrassSheen({ shape, width, intensity = 1, uid }: BrassSheenProps) {
  const reducedMotion = useReducedMotion();
  const height = (width * VIEWBOX.height) / VIEWBOX.width;
  const x = useSharedValue(-BAND_W * 2.5);

  useEffect(() => {
    if (reducedMotion) return;
    x.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(VIEWBOX.width + BAND_W, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
          withTiming(-BAND_W * 2.5, { duration: 0 }),
          withTiming(-BAND_W * 2.5, { duration: PAUSE_MS }),
        ),
        -1,
      ),
    );
  }, [reducedMotion, x]);

  const bandProps = useAnimatedProps(() => ({ x: x.value }));

  if (reducedMotion) return null;

  const id = `sheen_${uid}`;
  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
    >
      <Defs>
        <LinearGradient id={`${id}_band`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={badgeTones.brass.hi} stopOpacity={0} />
          <Stop offset="0.5" stopColor={badgeTones.silver.hi} stopOpacity={0.6 * intensity} />
          <Stop offset="1" stopColor={badgeTones.brass.hi} stopOpacity={0} />
        </LinearGradient>
        <ClipPath id={`${id}_shape`}>
          <Path d={SHAPES[shape]} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id}_shape)`}>
        <G transform="skewX(-18)">
          <AnimatedRect
            animatedProps={bandProps}
            y={-20}
            width={BAND_W}
            height={VIEWBOX.height + 40}
            fill={`url(#${id}_band)`}
          />
        </G>
      </G>
    </Svg>
  );
}
