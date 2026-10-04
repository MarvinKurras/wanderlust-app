import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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

  useEffect(() => {
    progress.value = visible
      ? withSpring(1, motionSprings.sheet)
      : withTiming(0, { duration: 160 });
    if (visible && destructive) warning();
  }, [visible, destructive, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }, { translateY: (1 - progress.value) * 16 }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.center}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable style={[StyleSheet.absoluteFill, styles.scrim]} onPress={onCancel} />
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
              <Button label={cancelLabel} variant="ghost" onPress={onCancel} fullWidth />
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
