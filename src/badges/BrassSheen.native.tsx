import { Canvas, Fill, Group, Shader, Skia, type SkPath } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import type { BadgeShape } from '@/lib/places';
import { useScreenActive } from '@/lib/screenActive';
import { useTilt } from '@/lib/tilt';
import { glass } from '@/theme';

import type { BrassSheenProps } from './BrassSheen';
import { CENTER, FIELD_SCALE, SHAPES, VIEWBOX } from './geometry';

/**
 * Messingglanz als Skia-Fragment-Shader (AP-D): ein weicher Lichtstreif mit
 * feiner Nebenkante wandert mit der Handyneigung über das Schild — wie Messing,
 * das man im Licht dreht. Ohne Uhr: gezeichnet wird nur, wenn sich die Neigung
 * ändert. Beschnitten wie auf der Website (`badges.js` glint) auf die eingelassene,
 * auf 0,88 skalierte Schildfläche, damit der Rahmen nicht mitglänzt.
 */
const SHEEN = Skia.RuntimeEffect.Make(`
uniform float2 u_size;
uniform float2 u_tilt;
uniform float u_intensity;
uniform float u_peak;
uniform float3 u_color;

half4 main(float2 pos) {
  float2 uv = pos / u_size;
  float d = uv.x * 0.78 + uv.y * 0.62;
  float c = 0.62 + u_tilt.x * 0.6 - u_tilt.y * 0.4;
  float b = (d - c) / 0.11;
  float e = (d - c - 0.2) / 0.035;
  float band = exp(-b * b);
  float edge = exp(-e * e) * 0.55;
  float a = clamp(band * u_peak + edge, 0.0, 1.0) * u_intensity;
  return half4(half3(u_color * a), half(a));
}
`);

const INSET = FIELD_SCALE;
const COLOR = (() => {
  const c = Skia.Color(glass.sheen);
  return [c[0], c[1], c[2]];
})();

/** Clip-Pfad der eingelassenen Fläche: Schildform, um CENTER auf 0,88 skaliert. */
function insetClip(shape: BadgeShape, width: number, height: number): SkPath | null {
  const path = Skia.Path.MakeFromSVGString(SHAPES[shape]);
  if (!path) return null;
  const m = Skia.Matrix();
  m.scale(width / VIEWBOX.width, height / VIEWBOX.height);
  m.translate(CENTER.x, CENTER.y);
  m.scale(INSET, INSET);
  m.translate(-CENTER.x, -CENTER.y);
  path.transform(m);
  return path;
}

export function BrassSheen({ shape, width, intensity = 1 }: BrassSheenProps) {
  const active = useScreenActive();
  const tilt = useTilt(active);
  const height = (width * VIEWBOX.height) / VIEWBOX.width;
  const clip = useMemo(() => insetClip(shape, width, height), [shape, width, height]);

  const uniforms = useDerivedValue(() => {
    const t = tilt.get();
    return {
      u_size: [width, height],
      u_tilt: [t.x, t.y],
      u_intensity: intensity,
      u_peak: glass.sheenPeak,
      u_color: COLOR,
    };
  });

  if (!SHEEN || !clip) return null;

  return (
    <Canvas pointerEvents="none" style={[StyleSheet.absoluteFill, { width, height }]}>
      <Group clip={clip}>
        <Fill>
          <Shader source={SHEEN} uniforms={uniforms} />
        </Fill>
      </Group>
    </Canvas>
  );
}
