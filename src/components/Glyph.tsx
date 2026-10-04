import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Eigenes Linien-Icon-Set (AP-D) im Strich der Website-Icons aus
 * „So funktioniert's" (1,6 px, runde Enden, 24er-Raster). `visit`, `emboss`
 * und `stock` sind die drei Website-Icons, halbiert vom 48er-Raster.
 */
export type GlyphName =
  | 'map'
  | 'signpost'
  | 'stock'
  | 'visit'
  | 'emboss'
  | 'hammer'
  | 'locate'
  | 'route'
  | 'lock'
  | 'check'
  | 'chevronLeft'
  | 'chevronRight'
  | 'close'
  | 'sliders'
  | 'mail'
  | 'trash'
  | 'shield'
  | 'mountain'
  | 'pin'
  | 'compass'
  | 'sparkle'
  | 'arrowRight'
  | 'refresh';

type Draw = (color: string) => ReactNode;

const GLYPHS: Record<GlyphName, Draw> = {
  map: () => (
    <>
      <Path d="M3.5 6.5 L9 4 L15 6.5 L20.5 4 V17.5 L15 20 L9 17.5 L3.5 20 Z" />
      <Path d="M9 4 V17.5" />
      <Path d="M15 6.5 V20" />
    </>
  ),
  signpost: () => (
    <>
      <Path d="M12 3 V21" />
      <Path d="M12 5.5 H18.5 L21 7.75 L18.5 10 H12" />
      <Path d="M12 11.5 H5.5 L3 13.75 L5.5 16 H12" />
      <Path d="M9 21 H15" />
    </>
  ),
  stock: () => (
    <>
      <Path d="M12 2.25 c-1.7 0 -2.5 0.9 -2.5 1.8 c0 0.9 0.8 1.7 2.5 1.7 c1.7 0 2.5 -0.8 2.5 -1.7 c0 -0.9 -0.8 -1.8 -2.5 -1.8 Z" />
      <Path d="M12 5.75 V21.5" />
      <Rect x={6.25} y={8} width={5} height={3.5} rx={0.75} />
      <Rect x={12.75} y={12.5} width={5} height={3.5} rx={0.75} />
      <Rect x={6.25} y={17} width={5} height={3.5} rx={0.75} />
    </>
  ),
  visit: () => (
    <>
      <Path d="M1.5 20 L8.5 8.5 L12 14 L15.5 10.5 L22.5 20 Z" />
      <Path d="M8.5 8.5 V3.5" />
      <Path d="M8.5 3.5 l4 1.3 -4 1.3" />
      <Circle cx={19.5} cy={4.5} r={1.8} />
      <Path d="M10.75 12.25 l1.25 1.75 1.3 -1.4" />
    </>
  ),
  emboss: () => (
    <>
      <Path d="M7 3.5 H17 V10.5 C17 15 14.5 17.75 12 19 C9.5 17.75 7 15 7 10.5 Z" />
      <Path d="M8.75 13.5 L12 8.5 L15.25 13.5 Z" />
      <Path d="M20.5 5 v3 M19 6.5 h3" />
      <Path d="M3.5 15 v2.5 M2.25 16.25 h2.5" />
    </>
  ),
  hammer: () => (
    <>
      <Path d="M13.2 4.2 L19.8 10.8 L17.6 13 L11 6.4 Z" />
      <Path d="M14.3 9.7 L5.2 18.8 a1.5 1.5 0 0 0 2.1 2.1 L16.4 11.8" />
      <Path d="M3 9 l1.6 0.6 M5.4 5.4 l0.6 1.6 M2.6 13 h1.7" />
    </>
  ),
  locate: (color) => (
    <>
      <Circle cx={12} cy={12} r={6.5} />
      <Path d="M12 2.5 V5.5 M12 18.5 V21.5 M2.5 12 H5.5 M18.5 12 H21.5" />
      <Circle cx={12} cy={12} r={1.8} fill={color} stroke="none" />
    </>
  ),
  route: (color) => (
    <>
      <Path d="M5 19 C8.5 19 8.5 14 12 14 C15.5 14 15.5 9.5 19 9.5" strokeDasharray="0.01 3.2" />
      <Circle cx={5} cy={19} r={1.7} fill={color} stroke="none" />
      <Path d="M19 9.5 V3.5 l3.2 1.2 -3.2 1.2" />
    </>
  ),
  lock: () => (
    <>
      <Path d="M7.5 10.5 V8 a4.5 4.5 0 0 1 9 0 V10.5" />
      <Rect x={5} y={10.5} width={14} height={10} rx={2.2} />
      <Path d="M12 14.5 V16.5" />
    </>
  ),
  check: () => <Path d="M5 12.5 l4.2 4.2 L19 7" />,
  chevronLeft: () => <Path d="M14.5 5.5 L8 12 L14.5 18.5" />,
  chevronRight: () => <Path d="M9.5 5.5 L16 12 L9.5 18.5" />,
  close: () => <Path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" />,
  sliders: () => (
    <>
      <Path d="M4 7 H7 M11 7 H20" />
      <Circle cx={9} cy={7} r={2} />
      <Path d="M4 12 H13 M17 12 H20" />
      <Circle cx={15} cy={12} r={2} />
      <Path d="M4 17 H6 M10 17 H20" />
      <Circle cx={8} cy={17} r={2} />
    </>
  ),
  mail: () => (
    <>
      <Rect x={3.5} y={5.5} width={17} height={13} rx={2} />
      <Path d="M4.2 7 L12 12.8 L19.8 7" />
    </>
  ),
  trash: () => (
    <>
      <Path d="M4.5 7 H19.5" />
      <Path d="M9.5 7 V4.5 H14.5 V7" />
      <Path d="M6.5 7 L7.5 20 H16.5 L17.5 7" />
      <Path d="M10 10.5 V16.5 M14 10.5 V16.5" />
    </>
  ),
  shield: () => (
    <>
      <Path d="M12 3 L19 6 V11.5 C19 16 15.8 19.4 12 21 C8.2 19.4 5 16 5 11.5 V6 Z" />
      <Path d="M9 12 l2.2 2.2 L15.2 10" />
    </>
  ),
  mountain: () => (
    <>
      <Path d="M2.5 19.5 L9 9 L13 15 L16 11 L21.5 19.5 Z" />
      <Path d="M7.3 11.8 L9 9 L10.7 11.7" />
    </>
  ),
  pin: () => (
    <>
      <Path d="M12 21 C12 21 5.5 14.6 5.5 9.5 a6.5 6.5 0 0 1 13 0 C18.5 14.6 12 21 12 21 Z" />
      <Circle cx={12} cy={9.5} r={2.3} />
    </>
  ),
  compass: (color) => (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 6.5 L14.2 12 L12 17.5 L9.8 12 Z" />
      <Path d="M12 6.5 L14.2 12 L9.8 12 Z" fill={color} />
    </>
  ),
  sparkle: () => (
    <Path d="M12 3 C12.6 8.4 15.6 11.4 21 12 C15.6 12.6 12.6 15.6 12 21 C11.4 15.6 8.4 12.6 3 12 C8.4 11.4 11.4 8.4 12 3 Z" />
  ),
  arrowRight: () => <Path d="M4.5 12 H19 M13.5 6.5 L19 12 L13.5 17.5" />,
  refresh: () => (
    <>
      <Path d="M19 12 a7 7 0 1 1 -2.05 -4.95" />
      <Path d="M19.5 4.5 V8.5 H15.5" />
    </>
  ),
};

type Props = {
  name: GlyphName;
  size?: number;
  color: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Glyph({ name, size = 22, color, strokeWidth = 1.6, style }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {GLYPHS[name](color)}
    </Svg>
  );
}

/** Für Tests/Previews: alle Namen. */
export const glyphNames = Object.keys(GLYPHS) as GlyphName[];
