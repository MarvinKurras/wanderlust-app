import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { GlassSurface } from '@/components/Glass';
import { tick } from '@/lib/haptics';
import { motionSprings } from '@/lib/motion';
import { colors, fonts, radius, spacing } from '@/theme';

type Option<K extends string> = { key: K; label: string };

type Props<K extends string> = {
  options: Option<K>[];
  value: K;
  onChange: (key: K) => void;
};

/** Segment-Schalter auf Glas; die Tinten-Pille gleitet federnd zur Auswahl. */
export function Segmented<K extends string>({ options, value, onChange }: Props<K>) {
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const active = layouts[value];

  const indicator = useAnimatedStyle(() => {
    if (!active) return { opacity: 0 };
    return {
      opacity: 1,
      transform: [{ translateX: withSpring(active.x, motionSprings.sheet) }],
      width: withSpring(active.width, motionSprings.sheet),
    };
  }, [active]);

  const onItemLayout = (key: K) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => ({ ...prev, [key]: { x, width } }));
  };

  return (
    <GlassSurface radius={radius.pill} style={styles.track}>
      <View style={styles.row}>
        <Animated.View style={[styles.indicator, indicator]} pointerEvents="none" />
        {options.map((option) => {
          const selected = option.key === value;
          return (
            <Pressable
              key={option.key}
              onLayout={onItemLayout(option.key)}
              onPress={() => {
                if (!selected) {
                  tick();
                  onChange(option.key);
                }
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={styles.item}
            >
              <Text style={[styles.label, selected && styles.labelActive]} numberOfLines={1}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'flex-start',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  item: {
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.ink,
  },
  labelActive: {
    color: colors.paper,
  },
});
