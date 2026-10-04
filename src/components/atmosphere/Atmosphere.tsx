import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { colors, landscape, withAlpha } from '@/theme';

import { Ranges } from './Ranges';
import { Cloud, Flock, FogBand, Glow, Grain, Stars, Sun } from './SkyLife';

export type AtmosphereVariant = 'paper' | 'pine' | 'dawn';

type Props = {
  variant: AtmosphereVariant;
  /** Pergament: Höhe des Horizonts hinter der Kopfzeile (px). */
  horizon?: number;
  /** Scroll-Position des Screens: der Horizont gleitet langsamer mit (Parallaxe). */
  scrollY?: SharedValue<number>;
};

/**
 * Lebendige Bühne hinter den Screens (AP-D) — die Website-Hero-Welt in drei
 * Stimmungen:
 * - `paper`: Pergament mit blassem Bergkupferstich am oberen Rand, Nebel zieht
 * - `pine`: Tannen-Nacht der Sammlung — Sterne, Mondschein, dunkle Ketten
 * - `dawn`: Morgen des Onboardings — Sonne, Wolken, Vögel, Skizzen-Intro
 * Alles liegt hinter dem Inhalt und nimmt keine Berührungen an.
 */
export const Atmosphere = memo(function Atmosphere({ variant, horizon = 240, scrollY }: Props) {
  const { width, height } = useWindowDimensions();
  const fallbackScroll = useSharedValue(0);
  const scroll = scrollY ?? fallbackScroll;
  const reducedMotion = useReducedMotion();
  // „Bewegung reduzieren": der Horizont steht still statt mitzugleiten.
  const horizonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: reducedMotion
          ? 0
          : interpolate(
              scroll.value,
              [-200, 0, horizon * 2],
              [60, 0, -horizon * 0.9],
              Extrapolation.CLAMP,
            ),
      },
    ],
  }));

  if (variant === 'dawn') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[landscape.skyTop, landscape.skyMid, landscape.skyLow]}
          locations={[0, 0.46, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Himmel zwischen Wörterbuch-Eintrag und Bergen: Sonne, Wolken, Vögel */}
        <Sun size={Math.min(340, width * 0.9)} x={width / 2} y={height * 0.6} />
        <Cloud
          kind={0}
          width={Math.min(190, width * 0.42)}
          left={width * 0.05}
          top={height * 0.53}
          delay={2200}
          duration={38000}
        />
        <Cloud
          kind={1}
          width={Math.min(120, width * 0.27)}
          left={width * 0.66}
          top={height * 0.6}
          delay={2600}
          duration={46000}
        />
        <Flock width={width} top={height * 0.5} />
        <Ranges width={width} height={height} palette="day" intro="sketch" restScale={0.92} />
        <Grain opacity={0.36} />
      </View>
    );
  }

  if (variant === 'pine') {
    const stage = height * 0.42;
    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.pine }]}
      >
        <LinearGradient
          colors={[landscape.nightSky, colors.pine, colors.pineSoft]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Stars width={width} height={height * 0.5} />
        <Glow
          size={width * 0.9}
          x={width * 0.82}
          y={height * 0.08}
          color={landscape.moonGlow}
          opacity={0.5}
        />
        <View style={[styles.bottomStage, { height: stage }]}>
          <Ranges width={width} height={stage} palette="night" intro="rise" restScale={0.7} />
          <FogBand
            width={width}
            top={stage * 0.28}
            height={stage * 0.3}
            color={landscape.nightFog}
            opacity={0.35}
            duration={52000}
          />
        </View>
        <Grain opacity={0.28} />
      </View>
    );
  }

  // paper
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.paper }]}>
      <Animated.View style={[styles.horizon, { height: horizon }, horizonStyle]}>
        <LinearGradient
          colors={[
            withAlpha(landscape.skyMid, 0.55),
            withAlpha(landscape.skyLow, 0.35),
            withAlpha(colors.paper, 0),
          ]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Glow
          size={width * 0.8}
          x={width * 0.72}
          y={horizon * 0.28}
          color={landscape.sunWarm}
          opacity={0.6}
        />
        <View style={[StyleSheet.absoluteFill, styles.engraving]}>
          <Ranges
            width={width}
            height={horizon}
            palette="engraving"
            intro="rise"
            layers={[0, 1, 2]}
            restScale={0.18}
          />
        </View>
        <FogBand width={width} top={horizon * 0.58} height={horizon * 0.3} opacity={0.6} />
        {/* Ketten lösen sich nach unten ins Pergament auf */}
        <LinearGradient
          colors={[withAlpha(colors.paper, 0), colors.paper]}
          locations={[0.4, 0.96]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Grain opacity={0.32} />
    </View>
  );
});

const styles = StyleSheet.create({
  horizon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  engraving: {
    opacity: 0.8,
  },
  bottomStage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
