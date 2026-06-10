import { Circle, G, Path, Rect } from 'react-native-svg';

import type { BadgeMotif } from '@/lib/places';

/**
 * Die sechs gemalten Landschaftsszenen der Stockschilder —
 * 1:1 aus `wanderlust/badges.js` (`scenery()`) portiert.
 * `id` referenziert die in StockBadge definierten Gradienten,
 * `cc` ist die Farbtransformation (Identität bzw. Locked-Approximation).
 */
type Props = {
  kind: BadgeMotif;
  id: string;
  cc: (hex: string) => string;
};

type CC = Props['cc'];

const Sky = ({ id }: { id: string }) => (
  <Rect x={-12} y={60} width={244} height={200} fill={`url(#sky_${id})`} />
);

const Sun = ({ cc }: { cc: CC }) => (
  <G>
    <Circle cx={158} cy={116} r={14} fill={cc('#f8e7ad')} />
    <Circle cx={158} cy={116} r={22} fill={cc('#fbeeba')} opacity={0.28} />
  </G>
);

const Far = ({ cc }: { cc: CC }) => (
  <Path
    d="M-12,196 L42,150 L92,188 L142,142 L188,184 L232,150 L232,214 L-12,214 Z"
    fill={cc('#a4bcc6')}
  />
);

const Mid = ({ cc }: { cc: CC }) => (
  <Path
    d="M-12,214 L52,164 L112,204 L170,154 L232,198 L232,222 L-12,222 Z"
    fill={cc('#7aa085')}
  />
);

const Ground = ({ cc }: { cc: CC }) => (
  <Rect x={-12} y={208} width={244} height={60} fill={cc('#33563f')} />
);

const Snow = ({ x, y, w, cc }: { x: number; y: number; w: number; cc: CC }) => (
  <Path
    d={`M${x - w},${y + w} L${x},${y} L${x + w},${y + w} L${x + w * 0.5},${y + w * 0.62} L${x},${y + w * 1.1} L${x - w * 0.5},${y + w * 0.62} Z`}
    fill={cc('#f5f7f3')}
  />
);

const Fir = ({ x, b, h, c, cc }: { x: number; b: number; h: number; c?: string; cc: CC }) => (
  <G>
    <Path
      d={`M${x},${b} L${x - h * 0.46},${b} L${x},${b - h * 0.55} L${x - h * 0.36},${b - h * 0.5} L${x},${b - h} L${x + h * 0.36},${b - h * 0.5} L${x + h * 0.46},${b} Z`}
      fill={cc(c ?? '#274b37')}
    />
    <Rect x={x - 1.4} y={b} width={2.8} height={4} fill={cc('#5a3d22')} />
  </G>
);

export function Scenery({ kind, id, cc }: Props) {
  switch (kind) {
    case 'peak':
      return (
        <G>
          <Sky id={id} />
          <Sun cc={cc} />
          <Far cc={cc} />
          <Mid cc={cc} />
          <Path d="M30,216 L110,112 L192,216 Z" fill={cc('#3f6b53')} />
          <Path d="M30,216 L110,112 L116,118 L150,216 Z" fill={cc('#345b46')} />
          <Snow x={110} y={112} w={22} cc={cc} />
          <Ground cc={cc} />
        </G>
      );

    case 'twin':
      return (
        <G>
          <Sky id={id} />
          <Sun cc={cc} />
          <Far cc={cc} />
          <Mid cc={cc} />
          <Path d="M22,216 L84,124 L142,216 Z" fill={cc('#436f56')} />
          <Path d="M104,216 L160,116 L214,216 Z" fill={cc('#39634f')} />
          <Snow x={84} y={124} w={18} cc={cc} />
          <Snow x={160} y={116} w={19} cc={cc} />
          <Ground cc={cc} />
        </G>
      );

    case 'lake':
      return (
        <G>
          <Sky id={id} />
          <Sun cc={cc} />
          <Path d="M-12,178 L40,128 L86,178 Z" fill={cc('#6f93a0')} />
          <Path d="M58,178 L120,112 L182,178 Z" fill={cc('#4d7763')} />
          <Snow x={120} y={112} w={18} cc={cc} />
          <Path d="M150,178 L200,134 L240,178 Z" fill={cc('#5d8470')} />
          <Rect x={-12} y={176} width={244} height={90} fill={`url(#water_${id})`} />
          <G opacity={0.55} stroke={cc('#eaf3f4')} strokeWidth={2} strokeLinecap="round">
            <Path d="M40,196 h36" />
            <Path d="M120,206 h44" />
            <Path d="M70,218 h30" />
            <Path d="M150,222 h40" />
          </G>
          <Path d="M150,168 l6,-16 l6,16 Z" fill={cc('#9c3a2e')} />
          <Rect x={153} y={160} width={6} height={10} fill={cc('#e7ddc8')} />
        </G>
      );

    case 'cliff':
      return (
        <G>
          <Sky id={id} />
          <Sun cc={cc} />
          <Rect x={-12} y={172} width={244} height={94} fill={`url(#water_${id})`} />
          <G opacity={0.5} stroke={cc('#eaf3f4')} strokeWidth={2} strokeLinecap="round">
            <Path d="M-10,200 h44" />
            <Path d="M150,212 h70" />
          </G>
          <Path
            d="M150,214 L150,150 C150,128 176,120 200,124 C224,128 232,150 232,214 Z"
            fill={cc('#f1ede2')}
          />
          <Path
            d="M40,214 L40,150 C40,126 66,118 92,120 C120,122 128,150 138,214 Z"
            fill={cc('#f5f1e7')}
          />
          <G stroke={cc('#cdc6b4')} strokeWidth={1.4} opacity={0.8}>
            <Path d="M58,150 V206" />
            <Path d="M78,146 V210" />
            <Path d="M98,150 V206" />
            <Path d="M188,150 V206" />
          </G>
          <Path
            d="M40,150 C40,126 66,118 92,120 C120,122 128,142 138,150 C120,138 70,138 40,150 Z"
            fill={cc('#3c6145')}
          />
          <Fir x={60} b={128} h={18} cc={cc} />
          <Fir x={96} b={124} h={20} cc={cc} />
          <Fir x={200} b={128} h={17} cc={cc} />
        </G>
      );

    case 'forest':
      return (
        <G>
          <Sky id={id} />
          <Sun cc={cc} />
          <Far cc={cc} />
          <Path
            d="M-12,216 L60,168 L120,210 L186,164 L232,206 L232,224 L-12,224 Z"
            fill={cc('#3c6347')}
          />
          <Ground cc={cc} />
          <Fir x={40} b={212} h={30} c="#214330" cc={cc} />
          <Fir x={74} b={216} h={26} c="#27503a" cc={cc} />
          <Fir x={112} b={210} h={34} c="#1f4030" cc={cc} />
          <Fir x={150} b={216} h={26} c="#27503a" cc={cc} />
          <Fir x={186} b={212} h={30} c="#214330" cc={cc} />
        </G>
      );

    case 'tower':
      return (
        <G>
          <Sky id={id} />
          <Sun cc={cc} />
          <Far cc={cc} />
          <Mid cc={cc} />
          <Path d="M28,216 L110,118 L192,216 Z" fill={cc('#436a55')} />
          <Snow x={110} y={118} w={16} cc={cc} />
          <Rect x={100} y={86} width={20} height={34} rx={2} fill={cc('#5b6168')} />
          <Rect x={96} y={82} width={28} height={7} rx={2} fill={cc('#71777d')} />
          <Path d="M100,86 L110,72 L120,86 Z" fill={cc('#8a9097')} />
          <Rect x={108} y={60} width={4} height={14} fill={cc('#6c7279')} />
          <Circle cx={110} cy={58} r={3} fill={cc('#b9bec3')} />
          <Ground cc={cc} />
        </G>
      );
  }
}
