import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { de } from '@/i18n/de';
import { tick } from '@/lib/haptics';
import { motionSprings } from '@/lib/motion';
import { colors, glass, radius, shadows, spacing } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Pergament-Sheet von unten (karte.html `.sheet`): federt herein, lässt sich
 * am Griff wegwischen, Tippen auf den Hintergrund schließt. Muster aus der
 * Spielesammlung; liegt in einem Modal, damit es auch die Tab-Leiste überdeckt.
 */
export function BottomSheet({ visible, onClose, children }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  // 0 = offen, 1 = ganz unten — relativ, damit eine Höhenänderung (Multi-Window,
  // Foldables) das Sheet nicht neu einfedern lässt.
  const hidden = useSharedValue(1);
  const drag = useSharedValue(0);

  if (visible && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      drag.set(0);
      hidden.set(1);
      hidden.set(withSpring(0, motionSprings.sheet));
    } else {
      hidden.set(
        withTiming(1, { duration: 240 }, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [drag, hidden, mounted, visible]);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      drag.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      if (drag.get() > 110 || event.velocityY > 900) {
        scheduleOnRN(tick);
        scheduleOnRN(onClose);
      } else {
        drag.set(withSpring(0, motionSprings.release));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hidden.get() * height + drag.get() }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      hidden.get() * height + drag.get(),
      [0, height * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <GestureHandlerRootView
        style={[StyleSheet.absoluteFill, styles.layer]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.scrim]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={de.allgemein.schliessen}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }, sheetStyle]}
        >
          <GestureDetector gesture={pan}>
            <View style={styles.grabArea}>
              <View style={styles.grabber} />
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 800,
    elevation: 800,
    justifyContent: 'flex-end',
  },
  scrim: {
    backgroundColor: colors.scrimSheet,
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderColor: glass.paperBorder,
    paddingHorizontal: spacing.lg,
    boxShadow: shadows.sheet,
  },
  grabArea: {
    alignItems: 'center',
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.md,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.paperLine,
  },
});
