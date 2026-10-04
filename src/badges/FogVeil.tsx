import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { landscape } from '@/theme';

type Props = {
  width: number;
  height: number;
  /** Eindeutige ID für die Verläufe. */
  uid: string;
  /** Dunkler Nebel für die Tannen-Nacht. */
  night?: boolean;
};

const drift = css.keyframes({
  from: { transform: [{ translateX: -7 }, { translateY: 2 }] },
  to: { transform: [{ translateX: 7 }, { translateY: -2 }] },
});
const breathe = css.keyframes({
  from: { opacity: 0.7 },
  to: { opacity: 1 },
});

/** Eine Schwade: driftet langsam seitwärts (außen) und atmet (innen). */
function Drift({
  duration,
  reverse,
  children,
}: {
  duration: number;
  reverse: boolean;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return <View style={StyleSheet.absoluteFill}>{children}</View>;
  }
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          animationName: drift,
          animationDuration: `${duration}ms`,
          animationIterationCount: 'infinite',
          animationDirection: reverse ? 'alternate-reverse' : 'alternate',
          animationTimingFunction: 'ease-in-out',
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            animationName: breathe,
            animationDuration: `${Math.round(duration * 0.7)}ms`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          },
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * „Liegt noch im Nebel" wörtlich: zwei Schwaden ziehen langsam über ein
 * verschlossenes Schild (karte.html `.fog .veil`, radial von innen nach außen).
 */
export function FogVeil({ width, height, uid, night = false }: Props) {
  const color = night ? landscape.nightFog : landscape.fog;
  const deep = night ? landscape.nightFog : landscape.fogDeep;
  // Die Zeichenfläche ragt über das Schild hinaus, damit die weichen Ränder
  // der Schwaden nicht an der Schildkante abgeschnitten werden.
  const padX = width * 0.3;
  const padY = height * 0.18;
  const w = width + padX * 2;
  const h = height + padY * 2;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: -padX, top: -padY, width: w, height: h }}
    >
      <Drift duration={9000} reverse={false}>
        <Svg width={w} height={h}>
          <Defs>
            <RadialGradient id={`fogA_${uid}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity={night ? 0.55 : 0.92} />
              <Stop offset="45%" stopColor={deep} stopOpacity={night ? 0.35 : 0.7} />
              <Stop offset="100%" stopColor={deep} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={padX + width * 0.42}
            cy={padY + height * 0.55}
            rx={width * 0.62}
            ry={height * 0.34}
            fill={`url(#fogA_${uid})`}
          />
        </Svg>
      </Drift>
      <Drift duration={12500} reverse>
        <Svg width={w} height={h}>
          <Defs>
            <RadialGradient id={`fogB_${uid}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity={night ? 0.45 : 0.85} />
              <Stop offset="100%" stopColor={deep} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={padX + width * 0.62}
            cy={padY + height * 0.36}
            rx={width * 0.48}
            ry={height * 0.26}
            fill={`url(#fogB_${uid})`}
          />
        </Svg>
      </Drift>
    </View>
  );
}
