import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  Platform,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { glass } from '@/theme';

/** Echtes Liquid Glass (iOS 26+) – sonst Pergament- bzw. Tannen-Glas mit Blur. */
export const hasLiquidGlass =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

const canBlur = Platform.OS === 'ios' || Platform.OS === 'web';

/**
 * Web: Inhalte ohne eigene Position malt der Browser unter absolut positionierte
 * Geschwister — die Glas-Ebenen rutschen darum hinter den Inhalt.
 */
const layerBehind = Platform.OS === 'web' ? { zIndex: -1 } : null;

export type GlassTone = 'paper' | 'pine';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Pergament-Welt (Karte, Orte …) oder Tannen-Nacht (Sammlung). */
  tone?: GlassTone;
  /** Liquid Glass reagiert auf Berührung (nur iOS 26). */
  interactive?: boolean;
  /** Blur-Stärke für den Fallback. */
  intensity?: number;
  onLayout?: (e: LayoutChangeEvent) => void;
};

/**
 * Glasfläche für schwebende Bedienelemente, Kopfleisten, Karten und Sheets
 * (Website: `karte.html --glass`). Inhalte liegen über dem Glas; das Glas
 * selbst bekommt keine Pointer-Events.
 */
export function GlassSurface({
  children,
  style,
  radius = 22,
  tone = 'paper',
  interactive = false,
  intensity = 32,
  onLayout,
}: Props) {
  const pine = tone === 'pine';

  if (hasLiquidGlass) {
    // Kinder *in* der GlassView sind auf iOS 26 nicht antippbar — darum liegt
    // das native Glas nur als Hintergrund-Ebene unter den Inhalten.
    return (
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]} onLayout={onLayout}>
        <GlassView
          pointerEvents="none"
          glassEffectStyle="regular"
          colorScheme={pine ? 'dark' : 'light'}
          tintColor={pine ? glass.pineTint : glass.paperTint}
          isInteractive={interactive}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { borderRadius: radius, borderColor: pine ? glass.pineBorder : glass.paperBorder },
        style,
      ]}
      onLayout={onLayout}
    >
      {canBlur && (
        <BlurView
          intensity={intensity}
          tint={pine ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, layerBehind]}
          pointerEvents="none"
        />
      )}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: pine
              ? canBlur
                ? glass.pineFill
                : glass.pineFillStrong
              : canBlur
                ? glass.paperFill
                : glass.paperFillStrong,
          },
          layerBehind,
        ]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[pine ? glass.pineHighlight : glass.paperHighlight, glass.highlightEnd]}
        locations={[0, 0.6]}
        style={[StyleSheet.absoluteFill, layerBehind]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
