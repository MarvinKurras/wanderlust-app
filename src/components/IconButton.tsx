import { StyleSheet } from 'react-native';

import { GlassSurface, type GlassTone } from '@/components/Glass';
import { Glyph, type GlyphName } from '@/components/Glyph';
import { PressableScale } from '@/components/PressableScale';
import { colors } from '@/theme';

type Props = {
  glyph: GlyphName;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: GlassTone;
  size?: number;
};

/** Runder Glas-Knopf (Zurück, Standort, Einstellungen). */
export function IconButton({
  glyph,
  onPress,
  accessibilityLabel,
  tone = 'paper',
  size = 44,
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      scaleTo={0.9}
      hitSlop={6}
    >
      <GlassSurface
        radius={size / 2}
        tone={tone}
        interactive
        style={[styles.btn, { width: size, height: size }]}
      >
        <Glyph
          name={glyph}
          size={size * 0.46}
          color={tone === 'pine' ? colors.paperOnPine : colors.ink}
          strokeWidth={1.8}
        />
      </GlassSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
