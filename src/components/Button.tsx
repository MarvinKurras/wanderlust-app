import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { Glyph, type GlyphName } from '@/components/Glyph';
import { PressableScale } from '@/components/PressableScale';
import { badgeTones, colors, fonts, radius, shadows, spacing } from '@/theme';

export type ButtonVariant = 'primary' | 'brass' | 'outline' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Pergament (Standard) oder Tannen-Nacht — betrifft outline/ghost. */
  tone?: 'paper' | 'pine';
  size?: 'md' | 'lg';
  glyph?: GlyphName;
  disabled?: boolean;
  busy?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const brass = badgeTones.brass;

/**
 * Pill-Buttons der Marke. `brass` ist der geprägte Messingknopf (Verlauf der
 * Badge-Metalltöne, dunkle Kante, Lichtkante oben) — nur für den einen
 * wichtigsten Schritt eines Screens, z. B. „Stocknagel prägen".
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'paper',
  size = 'md',
  glyph,
  disabled = false,
  busy = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: Props) {
  const pine = tone === 'pine';
  const fg =
    variant === 'primary'
      ? pine
        ? colors.pine
        : colors.paper
      : variant === 'brass'
        ? brass.edge
        : pine
          ? colors.paperOnPine
          : colors.ink;
  const inactive = disabled || busy;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy }}
      scaleTo={variant === 'brass' ? 0.955 : 0.965}
      style={[
        styles.base,
        size === 'lg' && styles.lg,
        fullWidth && styles.full,
        variant === 'primary' && { backgroundColor: pine ? colors.paperOnPine : colors.ink },
        variant === 'outline' && [
          styles.outline,
          { borderColor: pine ? colors.paperOnPineDim : colors.ink },
        ],
        variant === 'ghost' && styles.ghost,
        variant === 'brass' && styles.brass,
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant === 'brass' && (
        <>
          <LinearGradient
            colors={[brass.hi, brass.mid, brass.lo]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.brassLight} pointerEvents="none" />
        </>
      )}
      {busy ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        glyph && <Glyph name={glyph} size={size === 'lg' ? 19 : 16} color={fg} strokeWidth={1.8} />
      )}
      <Text
        style={[
          styles.label,
          size === 'lg' && styles.labelLg,
          { color: fg },
          variant === 'brass' && styles.engraved,
          variant === 'ghost' && styles.labelGhost,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  lg: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
  },
  full: {
    alignSelf: 'stretch',
  },
  outline: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
  },
  brass: {
    borderWidth: 1,
    borderColor: brass.edge,
    boxShadow: shadows.brassButton,
  },
  brassLight: {
    position: 'absolute',
    top: 1,
    left: 14,
    right: 14,
    height: 1,
    borderRadius: 1,
    backgroundColor: brass.hi,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  labelLg: {
    fontSize: 13,
    letterSpacing: 1.6,
  },
  labelGhost: {
    opacity: 0.8,
  },
  /** Gravur: dunkle Schrift mit heller Unterkante, wie in Messing geschlagen */
  engraved: {
    textShadowColor: brass.hi,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
});
