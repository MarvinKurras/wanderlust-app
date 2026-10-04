import type { Tabs } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/Glass';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { tick } from '@/lib/haptics';
import { motionSprings } from '@/lib/motion';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Platz, den Listen unten frei lassen müssen, damit nichts unter der Leiste liegt. */
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_GAP = 10;
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_GAP * 2;
}

const GLYPHS: Record<string, GlyphName> = {
  index: 'map',
  orte: 'signpost',
  sammlung: 'stock',
};

/**
 * Schwebende Glas-Tab-Leiste mit eigenen Glyphen (AP-D). Über der Sammlung
 * wechselt sie in Tannen-Glas; die Messing-Pille gleitet federnd zum Ziel.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const activeRoute = state.routes[state.index];
  const pine = activeRoute.name === 'sammlung';
  const active = layouts[activeRoute.key];

  const pill = useAnimatedStyle(() => {
    if (!active) return { opacity: 0 };
    return {
      opacity: 1,
      transform: [{ translateX: withSpring(active.x, motionSprings.sheet) }],
      width: withSpring(active.width, motionSprings.sheet),
    };
  }, [active]);

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + TAB_BAR_GAP }]} pointerEvents="box-none">
      <GlassSurface
        radius={radius.float + 10}
        tone={pine ? 'pine' : 'paper'}
        intensity={40}
        style={[styles.bar, { boxShadow: pine ? shadows.pine : shadows.float }]}
      >
        <View style={styles.row}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              { backgroundColor: pine ? colors.pineSoft : colors.paperDeep },
              pill,
            ]}
          />
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label = typeof options.title === 'string' ? options.title : route.name;
            const color = focused
              ? pine
                ? colors.brassLight
                : colors.brassDeep
              : pine
                ? colors.paperOnPineDim
                : colors.inkSoft;
            const onLayout = (e: LayoutChangeEvent) => {
              const { x, width } = e.nativeEvent.layout;
              setLayouts((prev) => ({ ...prev, [route.key]: { x, width } }));
            };
            return (
              <Pressable
                key={route.key}
                onLayout={onLayout}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    tick();
                    navigation.navigate(route.name, route.params);
                  }
                }}
                style={styles.item}
              >
                <Glyph
                  name={GLYPHS[route.name] ?? 'map'}
                  size={22}
                  color={color}
                  strokeWidth={focused ? 1.9 : 1.6}
                />
                <Text style={[styles.label, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  bar: {
    alignSelf: 'stretch',
    maxWidth: 420,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT - 10,
  },
  pill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.float + 5,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
