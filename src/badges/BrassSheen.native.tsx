import { Canvas, Fill, Group, Shader, Skia, useClock } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDerivedValue, useReducedMotion } from 'react-native-reanimated';

import { useTilt } from '@/lib/tilt';

import type { BrassSheenProps } from './BrassSheen';
import { SHAPES, VIEWBOX } from './geometry';

/**
 * Messingglanz als Skia-Fragment-Shader (AP-D): ein weicher Lichtstreif mit
 * feiner Nebenkante wandert mit der Handyneigung über das Schild, dazu ein
 * ganz langsamer Drift — wie Messing, das man im Licht dreht. Beschnitten auf
 * die exakte Schildform (`geometry.ts`), damit nichts über den Rand glänzt.
 */
const SHEEN = Skia.RuntimeEffect.Make(`
uniform float2 u_size;
uniform float2 u_tilt;
uniform float u_time;
uniform float u_intensity;

half4 main(float2 pos) {
  float2 uv = pos / u_size;
  float d = uv.x * 0.78 + uv.y * 0.62;
  float c = 0.62 + u_tilt.x * 0.6 - u_tilt.y * 0.4 + sin(u_time * 0.00035) * 0.16;
  float band = exp(-pow((d - c) / 0.11, 2.0));
  float edge = exp(-pow((d - c - 0.2) / 0.035, 2.0)) * 0.55;
  float a = clamp(band * 0.42 + edge, 0.0, 1.0) * u_intensity;
  float3 col = float3(1.0, 0.97, 0.86);
  return half4(half3(col * a), half(a));
}
`);

export function BrassSheen({ shape, width, intensity = 1 }: BrassSheenProps) {
  const tilt = useTilt();
  const clock = useClock();
  const reducedMotion = useReducedMotion();
  const height = (width * VIEWBOX.height) / VIEWBOX.width;

  const clip = useMemo(() => {
    const path = Skia.Path.MakeFromSVGString(SHAPES[shape]);
    if (!path) return null;
    const m = Skia.Matrix();
    m.scale(width / VIEWBOX.width, height / VIEWBOX.height);
    path.transform(m);
    return path;
  }, [shape, width, height]);

  const uniforms = useDerivedValue(() => ({
    u_size: [width, height],
    u_tilt: [tilt.value.x, tilt.value.y],
    u_time: reducedMotion ? 0 : clock.value,
    u_intensity: intensity,
  }));

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
