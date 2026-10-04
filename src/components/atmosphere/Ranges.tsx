import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { motionEasings } from '@/lib/motion';
import { useScreenActive } from '@/lib/screenActive';
import { useTilt } from '@/lib/tilt';
import { landscape } from '@/theme';

import {
  approxPathLength,
  capPath,
  firPath,
  RANGES,
  type RangeLayer,
  restOffset,
  VIEW_H,
  VIEW_W,
} from './ranges';

/** Seitlicher Überstand jeder Kette (Anteil der Breite) — Spielraum für die Neigung. */
const OVERHANG = 0.05;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

export type RangePalette = 'day' | 'night' | 'engraving';

/**
 * `sketch` = Website-Intro (Ketten steigen auf, Striche zeichnen sich, Farbe
 * blendet ein), `rise` = nur Aufsteigen, `none` = sofort in Ruhelage.
 */
export type RangeIntro = 'sketch' | 'rise' | 'none';

type Props = {
  width: number;
  height: number;
  palette?: RangePalette;
  intro?: RangeIntro;
  /** Welche Ketten (0 = hinten … 5 = vorne). Standard: alle. */
  layers?: number[];
  /** Ruhelage skalieren (< 1 = Ketten stehen höher im Bild). */
  restScale?: number;
  /** Neigungs-Parallaxe (Website: Maus-Parallaxe, vordere Ketten schwingen weiter). */
  parallax?: boolean;
  /** Startverzögerung des Intros in ms. */
  delay?: number;
};

const RISE_EASING = Easing.bezier(0.22, 0.75, 0.3, 1);

function fillFor(palette: RangePalette, index: number): string {
  return palette === 'night' ? landscape.nightRidges[index] : landscape.ridges[index];
}

const LayerView = memo(function LayerView({
  layer,
  index,
  width,
  height,
  palette,
  intro,
  restScale,
  parallax,
  delay,
}: {
  layer: RangeLayer;
  index: number;
  width: number;
  height: number;
  palette: RangePalette;
  intro: RangeIntro;
  restScale: number;
  parallax: boolean;
  delay: number;
}) {
  const reducedMotion = useReducedMotion();
  const active = useScreenActive();
  const tilt = useTilt(parallax && active);
  const animate = intro !== 'none' && !reducedMotion;
  const sketch = intro === 'sketch' && !reducedMotion;

  const layerH = (layer.h / 100) * height;
  const rest = ((restOffset(index) * restScale) / 100) * height;
  const start = ((layer.h + 16) / 100) * height;
  // Website-Takt: Ebene i startet um 0,1 s + i·0,24 s versetzt
  const t0 = delay + (100 + index * 240);
  const restInk = palette === 'engraving' ? 0.32 : 0.18 + index * 0.03;
  const drawsLine = palette !== 'night';

  const rise = useSharedValue(animate ? 0 : 1);
  const draw = useSharedValue(sketch ? 0 : 1);
  const fill = useSharedValue(sketch ? 0 : 1);
  const ink = useSharedValue(sketch ? 1 : restInk);

  useEffect(() => {
    if (!animate) return;
    rise.value = withDelay(
      delay + 150 + index * 220,
      withTiming(1, { duration: 1600, easing: RISE_EASING }),
    );
    if (sketch) {
      draw.value = withDelay(t0, withTiming(1, { duration: 1050, easing: motionEasings.draw }));
      fill.value = withDelay(t0 + 680, withTiming(1, { duration: 900 }));
      ink.value = withDelay(t0 + 1500, withTiming(restInk, { duration: 900 }));
    }
  }, [animate, sketch, delay, index, t0, restInk, rise, draw, fill, ink]);

  const ridgeLen = useMemo(() => approxPathLength(layer.ridge), [layer.ridge]);
  const detailLens = useMemo(
    () => (layer.details ?? []).map((d) => approxPathLength(d)),
    [layer.details],
  );

  // Website app.js: x = mx·(6+i·7) mit mx in ±0,5 — die Neigung hier läuft ±1,
  // darum halbiert und auf den Überstand begrenzt, damit keine Kante ins Bild rückt.
  const swing = parallax ? Math.min((6 + index * 7) / 2, width * OVERHANG) : 0;
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tilt.value.x * swing },
      { translateY: start + (rest - start) * rise.value },
    ],
  }));
  const fillProps = useAnimatedProps(() => ({ opacity: fill.value }));
  const ridgeProps = useAnimatedProps(() => ({
    strokeDashoffset: ridgeLen * (1 - draw.value),
    strokeOpacity: ink.value,
  }));
  const detailProps = useAnimatedProps(() => ({
    opacity:
      Math.min(1, Math.max(0, draw.value * 1.4 - 0.4)) * (palette === 'engraving' ? 0.4 : 0.3),
  }));

  const fillColor = fillFor(palette, index);
  const closed = `${layer.ridge} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.layer,
        {
          height: layerH,
          left: -width * OVERHANG,
          width: width * (1 + OVERHANG * 2),
          zIndex: index + 1,
        },
        containerStyle,
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <AnimatedG animatedProps={fillProps}>
          <Path d={closed} fill={fillColor} />
          {layer.caps && palette !== 'night' && (
            <G fill={landscape.snow} fillOpacity={0.92}>
              {layer.caps.map(([x, y, w]) => (
                <Path key={`${x}`} d={capPath(x, y, w)} />
              ))}
            </G>
          )}
          {layer.firs && (
            <G fill={palette === 'night' ? landscape.nightSky : landscape.fir}>
              {layer.firs.map(([x, b, h]) => (
                <Path key={`${x}`} d={firPath(x, b, h)} />
              ))}
            </G>
          )}
        </AnimatedG>
        {drawsLine && (
          <AnimatedPath
            d={layer.ridge}
            fill="none"
            stroke={landscape.sketch}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[ridgeLen, ridgeLen]}
            animatedProps={ridgeProps}
          />
        )}
        {drawsLine &&
          (layer.details ?? []).map((d, k) => (
            <AnimatedPath
              key={d}
              d={d}
              fill="none"
              stroke={landscape.sketch}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeDasharray={[detailLens[k], detailLens[k]]}
              animatedProps={detailProps}
            />
          ))}
      </Svg>
    </Animated.View>
  );
});

/** Die Bergbühne der Website als wiederverwendbare Ebene (AP-D). */
export function Ranges({
  width,
  height,
  palette = 'day',
  intro = 'none',
  layers,
  restScale = 1,
  parallax = true,
  delay = 0,
}: Props) {
  const indices = layers ?? RANGES.map((_, i) => i);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      {indices.map((i) => (
        <LayerView
          key={i}
          layer={RANGES[i]}
          index={i}
          width={width}
          height={height}
          palette={palette}
          intro={intro}
          restScale={restScale}
          parallax={parallax}
          delay={delay}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    bottom: 0,
  },
});
