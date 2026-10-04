import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface, type GlassTone } from '@/components/Glass';
import { colors, fonts, spacing, textStyles } from '@/theme';

/** Höhe der kompakten Kopfleiste unter der Statusleiste. */
export const COMPACT_HEADER_H = 54;

/** Scroll-Position für großen Titel, Kopfleiste und Horizont-Parallaxe. */
export function useCollapsingHeader() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  return { scrollY, onScroll };
}

type LargeTitleProps = {
  eyebrow?: string;
  title: string;
  scrollY: SharedValue<number>;
  tone?: GlassTone;
  /** Rechts neben dem Eyebrow (z. B. Einstellungen). */
  accessory?: ReactNode;
  /** Ohne eigenen Seitenrand (wenn die Liste ihn schon setzt). */
  flush?: boolean;
  children?: ReactNode;
};

/**
 * Großer Screen-Titel (Website: .eyebrow mit Messingstrich + Cormorant-Headline).
 * Beim Scrollen wandert er in die Kopfleiste: er hebt sich leicht und blendet aus.
 */
export function LargeTitle({
  eyebrow,
  title,
  scrollY,
  tone = 'paper',
  accessory,
  flush = false,
  children,
}: LargeTitleProps) {
  const insets = useSafeAreaInsets();
  const pine = tone === 'pine';
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 70], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [-120, 0, 120], [36, 0, -18], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-120, 0], [1.06, 1], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={[styles.large, flush && styles.flush, { paddingTop: insets.top + spacing.lg }]}>
      <Animated.View style={[styles.largeInner, style]}>
        {(eyebrow || accessory) && (
          <View style={styles.eyebrowRow}>
            {eyebrow ? (
              <View style={styles.eyebrow}>
                <View style={[styles.dash, pine && { backgroundColor: colors.brassLight }]} />
                <Text style={[textStyles.eyebrow, pine && { color: colors.brassLight }]}>
                  {eyebrow}
                </Text>
              </View>
            ) : (
              <View />
            )}
            {accessory}
          </View>
        )}
        <Text
          style={[styles.title, pine && { color: colors.paperOnPine }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </Animated.View>
      {children}
    </View>
  );
}

type CompactHeaderProps = {
  title: string;
  scrollY: SharedValue<number>;
  tone?: GlassTone;
  left?: ReactNode;
  right?: ReactNode;
  /** Ab welcher Scrolltiefe das Glas erscheint (px). Detail-Screens: früher. */
  threshold?: number;
};

/** Glas-Kopfleiste, die beim Scrollen erscheint; Knöpfe links/rechts sind immer da. */
export function CompactHeader({
  title,
  scrollY,
  tone = 'paper',
  left,
  right,
  threshold = 60,
}: CompactHeaderProps) {
  const insets = useSafeAreaInsets();
  const glassStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [threshold - 20, threshold + 20],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [threshold, threshold + 30], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [threshold, threshold + 30],
          [8, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const height = insets.top + COMPACT_HEADER_H;

  return (
    <View style={[styles.compact, { height }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, glassStyle]} pointerEvents="none">
        <GlassSurface
          radius={0}
          tone={tone}
          style={[StyleSheet.absoluteFill, styles.compactGlass]}
        />
      </Animated.View>
      <View style={[styles.compactRow, { marginTop: insets.top }]} pointerEvents="box-none">
        <View style={styles.side}>{left}</View>
        <Animated.Text
          style={[
            styles.compactTitle,
            tone === 'pine' && { color: colors.paperOnPine },
            titleStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  large: {
    paddingHorizontal: spacing.lg,
  },
  flush: {
    paddingHorizontal: 0,
  },
  largeInner: {
    transformOrigin: 'left top',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xs,
  },
  dash: {
    width: 34,
    height: 1,
    backgroundColor: colors.brass,
  },
  title: {
    ...textStyles.title,
    fontSize: 46,
    lineHeight: 50,
    marginTop: spacing.xs,
  },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  compactGlass: {
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compactRow: {
    height: COMPACT_HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  compactTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.displaySemiBold,
    fontSize: 21,
    color: colors.ink,
  },
});
