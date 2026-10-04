import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Button } from '@/components/Button';
import { GlassSurface } from '@/components/Glass';
import { warning } from '@/lib/haptics';
import { motionSprings } from '@/lib/motion';
import { colors, fonts, spacing, textStyles } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Unumkehrbare Aktion (z. B. Löschen): Haptik-Warnung, Bestätigen als Umriss. */
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** App-eigener Bestätigungsdialog im Pergament-Look statt System-`Alert` (Spielesammlung-Muster). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const progress = useSharedValue(0);
  // Das Modal bleibt bis zum Ende der Ausblendung gemountet (wie BottomSheet).
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.set(withSpring(1, motionSprings.sheet));
      if (destructive) warning();
    } else {
      progress.set(
        withTiming(0, { duration: 160 }, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, mounted, destructive, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.92 + progress.get() * 0.08 }, { translateY: (1 - progress.get()) * 16 }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));

  // Während die Aktion läuft, lässt sich der Dialog nicht wegtippen.
  const cancel = () => {
    if (!busy) onCancel();
  };

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={cancel}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.center} pointerEvents={visible ? 'auto' : 'none'}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable style={[StyleSheet.absoluteFill, styles.scrim]} onPress={cancel} />
        </Animated.View>
        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <GlassSurface radius={24} style={styles.card} intensity={50}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.actions}>
              <Button
                label={confirmLabel}
                variant={destructive ? 'outline' : 'primary'}
                onPress={onConfirm}
                busy={busy}
                fullWidth
              />
              <Button
                label={cancelLabel}
                variant="ghost"
                onPress={cancel}
                disabled={busy}
                fullWidth
              />
            </View>
          </GlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  scrim: {
    backgroundColor: colors.scrim,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    padding: spacing.lg,
    // Opakes Pergament: Text dahinter soll nicht durchscheinen (wie das Website-Modal)
    backgroundColor: colors.paper,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 28,
    lineHeight: 31,
    color: colors.ink,
  },
  message: {
    ...textStyles.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
});
