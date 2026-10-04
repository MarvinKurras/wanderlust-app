import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { playState, useScreenActive } from '@/lib/screenActive';
import { landscape } from '@/theme';

type Props = {
  width: number;
  height: number;
  /** Eindeutige ID für die Verläufe. */
  uid: string;
  /** Dunkler Nebel für die Tannen-Nacht. */
  night?: boolean;
  /** `false` für kleine Schilder in Listen: Nebel liegt still (spart Dauerschleifen). */
  animated?: boolean;
};

/** Eine Keyframe-Folge pro Schwade: seitwärts driften und dabei atmen. */
const puff = css.keyframes({
  from: { transform: [{ translateX: -7 }, { translateY: 2 }], opacity: 0.7 },
  to: { transform: [{ translateX: 7 }, { translateY: -2 }], opacity: 1 },
});

function Drift({
  duration,
  reverse,
  animated,
  children,
}: {
  duration: number;
  reverse: boolean;
  animated: boolean;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const active = useScreenActive();
  if (reducedMotion || !animated) {
    return <View style={StyleSheet.absoluteFill}>{children}</View>;
  }
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          animationName: puff,
          animationDuration: `${duration}ms`,
          animationIterationCount: 'infinite',
          animationDirection: reverse ? 'alternate-reverse' : 'alternate',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: playState(active),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * „Liegt noch im Nebel" wörtlich: zwei Schwaden ziehen langsam über ein
 * verschlossenes Schild (karte.html `.fog .veil`, radial von innen nach außen).
 */
export function FogVeil({ width, height, uid, night = false, animated = true }: Props) {
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
      <Drift duration={9000} reverse={false} animated={animated}>
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
      <Drift duration={12500} reverse animated={animated}>
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
