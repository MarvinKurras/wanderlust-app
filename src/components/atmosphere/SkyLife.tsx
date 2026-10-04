import { LinearGradient } from 'expo-linear-gradient';
import { memo, useId, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { css, useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { playState, useScreenActive } from '@/lib/screenActive';
import { landscape, withAlpha } from '@/theme';

/**
 * Himmelsleben der Bergbühne — Port aus dem Website-Hero (`app.js` skylife,
 * `index.html` .sun/.cloud/.flock). Alle Dauerschleifen sind langsam,
 * entfallen bei „Bewegung reduzieren" und pausieren, solange der Screen nicht
 * sichtbar ist (`useScreenActive`).
 */

/** SVG-IDs sind im Web dokumentweit — pro Instanz eindeutig machen. */
function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

const fadeIn = css.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

/** Sonne mit Halo (index.html .sun + ::after). */
export function Sun({
  size,
  x,
  y,
  delay = 900,
}: {
  size: number;
  x: number;
  y: number;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const halo = useSvgId('sunHalo');
  const core = useSvgId('sunCore');
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size },
        !reducedMotion && {
          opacity: 0,
          animationName: fadeIn,
          animationDuration: '1600ms',
          animationDelay: `${delay}ms`,
          animationFillMode: 'forwards',
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={halo} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={landscape.sunHalo} stopOpacity={0.95} />
            <Stop offset="42%" stopColor={landscape.sunHaloWarm} stopOpacity={0.55} />
            <Stop offset="70%" stopColor={landscape.sunHaloWarm} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={core} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={landscape.sunCore} />
            <Stop offset="70%" stopColor={landscape.sunWarm} />
            <Stop offset="100%" stopColor={landscape.sunWarm} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${halo})`} />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.14} fill={`url(#${core})`} />
      </Svg>
    </Animated.View>
  );
}

const cloudDrift = css.keyframes({
  from: { transform: [{ translateX: -22 }] },
  to: { transform: [{ translateX: 26 }] },
});

const CLOUDS = [
  {
    viewBox: '0 0 230 78',
    d: 'M26,58 Q12,56 14,46 Q8,34 24,30 Q26,14 46,16 Q56,2 78,8 Q96,0 108,12 Q128,6 134,22 Q154,20 156,36 Q170,40 164,52 Q168,62 150,60 Q120,66 88,62 Q52,66 26,58 Z',
    ratio: 78 / 230,
  },
  {
    viewBox: '0 0 120 60',
    d: 'M18,44 Q8,42 12,34 Q10,22 26,22 Q32,8 52,12 Q66,4 78,14 Q94,12 96,26 Q108,30 102,40 Q104,48 88,46 Q56,52 18,44 Z',
    ratio: 60 / 120,
  },
];

/** Skizzierte Wolke (app.js .cloud c1/c2), driftet langsam hin und her. */
export function Cloud({
  kind,
  width,
  left,
  top,
  delay,
  duration,
}: {
  kind: 0 | 1;
  width: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}) {
  const reducedMotion = useReducedMotion();
  const active = useScreenActive();
  const cloud = CLOUDS[kind];
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left, top, width, height: width * cloud.ratio },
        !reducedMotion && {
          opacity: 0,
          animationName: [fadeIn, cloudDrift],
          animationDuration: ['1800ms', `${duration}ms`],
          animationDelay: [`${delay}ms`, '0ms'],
          animationFillMode: ['forwards', 'none'],
          animationIterationCount: [1, 'infinite'],
          animationDirection: ['normal', 'alternate'],
          animationTimingFunction: ['ease', 'ease-in-out'],
          animationPlayState: playState(active),
        },
      ]}
    >
      <Svg width="100%" height="100%" viewBox={cloud.viewBox}>
        <Path
          d={cloud.d}
          fill={landscape.cloudFill}
          fillOpacity={0.9}
          stroke={landscape.cloudStroke}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

const flap = css.keyframes({
  from: { transform: [{ scaleY: 1 }] },
  to: { transform: [{ scaleY: 0.55 }] },
});

/** Vogelschwarm (app.js .flock): drei Vögel ziehen quer über den Himmel. */
export function Flock({ width, top }: { width: number; top: number }) {
  const reducedMotion = useReducedMotion();
  const active = useScreenActive();
  const fly = useMemo(
    () =>
      css.keyframes({
        '0%': { transform: [{ translateX: -width * 0.12 }, { translateY: 0 }], opacity: 0 },
        '5%': { opacity: 0.8 },
        '50%': { transform: [{ translateX: width * 0.52 }, { translateY: -34 }] },
        '92%': { opacity: 0.8 },
        '100%': { transform: [{ translateX: width * 1.16 }, { translateY: -50 }], opacity: 0 },
      }),
    [width],
  );
  if (reducedMotion) return null;
  const birds = [
    { w: 26, mt: 0, delay: 0 },
    { w: 20, mt: 14, delay: 200 },
    { w: 16, mt: 4, delay: 450 },
  ];
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top,
        flexDirection: 'row',
        gap: 16,
        opacity: 0,
        animationName: fly,
        animationDuration: '46s',
        animationDelay: '3.4s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
        animationPlayState: playState(active),
      }}
    >
      {birds.map((b) => (
        <Animated.View
          key={b.w}
          style={{
            width: b.w,
            height: (b.w * 12) / 28,
            marginTop: b.mt,
            animationName: flap,
            animationDuration: '850ms',
            animationDelay: `${b.delay}ms`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
            animationPlayState: playState(active),
          }}
        >
          <Svg width="100%" height="100%" viewBox="0 0 28 12">
            <Path
              d="M2,9 Q8,2 14,8 Q20,2 26,9"
              stroke={landscape.sketch}
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const twinkle = css.keyframes({
  from: { opacity: 0.2 },
  to: { opacity: 1 },
});

/** Drei phasenversetzte Gruppen statt einer Schleife pro Stern (UI-Thread schonen). */
const STAR_GROUPS = [
  { duration: 3400, delay: 0 },
  { duration: 4700, delay: 1300 },
  { duration: 6100, delay: 2600 },
];

/** Sternenhimmel der Sammlung (Tannen-Nacht). */
export const Stars = memo(function Stars({
  width,
  height,
  count = 30,
}: {
  width: number;
  height: number;
  count?: number;
}) {
  const reducedMotion = useReducedMotion();
  const active = useScreenActive();
  const groups = useMemo(() => {
    const out = STAR_GROUPS.map(
      () => [] as { left: number; top: number; size: number; glow: number }[],
    );
    for (let i = 0; i < count; i += 1) {
      out[i % STAR_GROUPS.length].push({
        left: pseudoRandom(i + 3) * width,
        top: Math.pow(pseudoRandom(i + 17), 1.4) * height,
        size: 1 + pseudoRandom(i + 29) * 1.8,
        glow: 0.45 + pseudoRandom(i + 41) * 0.4,
      });
    }
    return out;
  }, [width, height, count]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {groups.map((stars, g) => (
        <Animated.View
          key={g}
          style={[
            StyleSheet.absoluteFill,
            { opacity: 0.6 },
            !reducedMotion && {
              animationName: twinkle,
              animationDuration: `${STAR_GROUPS[g].duration}ms`,
              animationDelay: `${STAR_GROUPS[g].delay}ms`,
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationTimingFunction: 'ease-in-out',
              animationPlayState: playState(active),
            },
          ]}
        >
          {stars.map((star, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                borderRadius: star.size,
                backgroundColor: landscape.star,
                opacity: star.glow,
              }}
            />
          ))}
        </Animated.View>
      ))}
    </View>
  );
});

/** Weicher Lichtschein (Mond über der Sammlung, Sonne auf Pergament). */
export function Glow({
  size,
  x,
  y,
  color,
  opacity = 1,
}: {
  size: number;
  x: number;
  y: number;
  color: string;
  opacity?: number;
}) {
  const id = useSvgId('glow');
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, opacity }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <Stop offset="45%" stopColor={color} stopOpacity={0.16} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Nebelband, das langsam über die Ketten zieht (karte.html Fog-Schleier). */
export function FogBand({
  width,
  top,
  height,
  color = landscape.fog,
  opacity = 0.7,
  duration = 42000,
  reverse = false,
}: {
  width: number;
  top: number;
  height: number;
  color?: string;
  opacity?: number;
  duration?: number;
  reverse?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const active = useScreenActive();
  const puffId = useSvgId('puff');
  const drift = useMemo(
    () =>
      css.keyframes({
        from: { transform: [{ translateX: -width * 0.5 }] },
        to: { transform: [{ translateX: 0 }] },
      }),
    [width],
  );
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: 0, top, width: width * 2, height, opacity },
        !reducedMotion && {
          animationName: drift,
          animationDuration: `${duration}ms`,
          animationIterationCount: 'infinite',
          animationDirection: reverse ? 'alternate-reverse' : 'alternate',
          animationTimingFunction: 'ease-in-out',
          animationPlayState: playState(active),
        },
      ]}
    >
      <LinearGradient
        colors={[withAlpha(color, 0), withAlpha(color, 0.85), withAlpha(color, 0)]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Schwaden: weiche Ellipsen geben dem Band Struktur */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={puffId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.7} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {[0.08, 0.31, 0.55, 0.78].map((fx) => (
          <Circle
            key={fx}
            cx={fx * width * 2}
            cy={height / 2}
            r={height * 0.9}
            fill={`url(#${puffId})`}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

/** Papierkorn (Website .grain, ~5 % Deckung) als Kachel (A-D-2). */
export function Grain({ opacity = 0.55 }: { opacity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require('@/assets/textures/grain.png')}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { opacity, width: '100%', height: '100%' }]}
      />
    </View>
  );
}
