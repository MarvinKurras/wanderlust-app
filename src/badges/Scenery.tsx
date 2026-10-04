import { Circle, G, Path, Rect } from 'react-native-svg';

import type { BadgeMotif } from '@/lib/places';

import {
  crownsAlong,
  fir,
  hatch,
  gullies,
  line,
  mirror,
  mountain,
  type Mountain,
  poly,
  type Pt,
  shadowFace,
  shadowFacePts,
  skyHatch,
  snowCap,
  summitCross,
  sunRays,
  trail,
  treeline,
  waterLines,
} from './sceneryKit';

/**
 * Die sechs Landschaftsszenen der Stocknägel (AP-D2). Motive und Aufbau
 * folgen `wanderlust/badges.js`; die Ausführung ist veredelt: Emaille-Flächen
 * mit Konturstegen in der Metallfarbe, Licht- und Schattenflanken, Gravur-
 * Schraffur. `detail` (ab 100 dp) schaltet Feinheiten zu, die klein nur flimmern.
 */
type Props = {
  kind: BadgeMotif;
  id: string;
  /** Farbtransformation (Identität bzw. Locked-Approximation). */
  cc: (hex: string) => string;
  /** Konturfarbe — die (bereits transformierte) Kantenfarbe des Metalls. */
  ink: string;
  detail: boolean;
};

/** Emaille-Palette der Szenen (gedämpfter als die Website-Flächen). */
export const SCENE = {
  skyTop: '#b5c9cf',
  skyMid: '#d6dfd9',
  skyLow: '#edebdf',
  skyLine: '#93abb3',
  sun: '#f2dfa0',
  sunGlow: '#f7ebc4',
  sunLine: '#c4a258',
  bird: '#4a616c',
  far: '#a4b7bd',
  mid: '#7b9a85',
  rock: '#4d725d',
  rockFront: '#44695a',
  rockLake: '#557c69',
  shade: '#0e1c14',
  snow: '#f4f5ef',
  gully: '#24392d',
  trail: '#efe4c4',
  cross: '#c9a14a',
  meadow: '#3d6147',
  hill: '#5c8166',
  waterTop: '#8ab4c3',
  waterBottom: '#4b849c',
  waterLine: '#e4eef0',
  chalk: '#f3efe4',
  chalkShade: '#d6cdb8',
  fissure: '#b5ab94',
  beech: '#4a6e4c',
  fir: '#23402e',
  firBack: '#2f5240',
  trunk: '#5a3d22',
  stone: '#a29d92',
  stoneShade: '#837e74',
  masonry: '#6a665e',
  patina: '#6a968a',
  tile: '#9a4733',
  wall: '#efe8d8',
  window: '#2c332f',
  sail: '#f6f2e6',
} as const;

type SunSpot = { cx: number; cy: number; r: number };
const SUN: SunSpot = { cx: 156, cy: 112, r: 9.5 };
/** Doppelgipfel: Sonne weiter rechts oben, damit das Gipfelkreuz frei steht. */
const SUN_TWIN: SunSpot = { cx: 172, cy: 103, r: 8.5 };

type Ctx = {
  id: string;
  sun: SunSpot;
  cc: (hex: string) => string;
  ink: string;
  detail: boolean;
};

/** Konturstege: feine Linie in der Metallfarbe um jede Emaille-Fläche. */
function contourOf(ink: string) {
  return {
    stroke: ink,
    strokeWidth: 0.85,
    strokeOpacity: 0.55,
    strokeLinejoin: 'round' as const,
  };
}

function Sky({ ctx }: { ctx: Ctx }) {
  return (
    <G>
      <Rect x={-12} y={60} width={244} height={200} fill={`url(#sky_${ctx.id})`} />
      {ctx.detail && (
        <G fill="none" stroke={ctx.cc(SCENE.skyLine)} strokeWidth={0.45} strokeLinecap="round">
          <Path
            d={skyHatch(95, 112, 3.4, { ...ctx.sun, r: ctx.sun.r + 11.5 })}
            strokeOpacity={0.5}
          />
          <Path
            d={skyHatch(115.2, 132, 4.2, { ...ctx.sun, r: ctx.sun.r + 11.5 })}
            strokeOpacity={0.28}
          />
        </G>
      )}
    </G>
  );
}

function Sun({ ctx }: { ctx: Ctx }) {
  const { cc, sun: SUN } = ctx;
  return (
    <G>
      <Circle cx={SUN.cx} cy={SUN.cy} r={SUN.r + 6} fill={cc(SCENE.sunGlow)} opacity={0.45} />
      <Circle
        cx={SUN.cx}
        cy={SUN.cy}
        r={SUN.r}
        fill={cc(SCENE.sun)}
        stroke={cc(SCENE.sunLine)}
        strokeWidth={0.7}
      />
      {ctx.detail && (
        <Path
          d={sunRays(SUN.cx, SUN.cy, SUN.r + 3.5, SUN.r + 8.5)}
          stroke={cc(SCENE.sunLine)}
          strokeWidth={0.6}
          strokeLinecap="round"
          strokeOpacity={0.75}
        />
      )}
    </G>
  );
}

function Birds({ ctx, at = [58, 108] }: { ctx: Ctx; at?: Pt }) {
  return (
    <G
      stroke={ctx.cc(SCENE.bird)}
      strokeWidth={1}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.75}
    >
      <Path d={`M${at[0]},${at[1]} q4,-4.5 8,0 q4,-4.5 8,0`} />
      <Path d={`M${at[0] + 22},${at[1] + 10} q3,-3.5 6,0 q3,-3.5 6,0`} />
    </G>
  );
}

function Range({ ctx, pts, fill }: { ctx: Ctx; pts: Pt[]; fill: string }) {
  return <Path d={poly(pts)} fill={ctx.cc(fill)} {...contourOf(ctx.ink)} />;
}

/** Berg mit Schattenflanke, Schnee, Rinnen, optional Pfad und Gipfelkreuz. */
function Peak({
  ctx,
  m,
  fill,
  snow,
  withTrail = false,
  withCross = false,
}: {
  ctx: Ctx;
  m: Mountain;
  fill: string;
  snow: number;
  withTrail?: boolean;
  withCross?: boolean;
}) {
  const { cc, detail } = ctx;
  const contour = contourOf(ctx.ink);
  return (
    <G>
      <Path d={poly(m.outline)} fill={cc(fill)} />
      {snow > 0 && <Path d={snowCap(m, snow)} fill={cc(SCENE.snow)} />}
      <Path d={shadowFace(m)} fill={SCENE.shade} opacity={0.2} />
      {detail && (
        // Kupferstich: Schraffur der Schattenflanke parallel zur Flanke
        <Path
          d={hatch(shadowFacePts(m), slopeAngle(m), 2.3)}
          stroke={cc(SCENE.gully)}
          strokeWidth={0.42}
          strokeOpacity={0.42}
        />
      )}
      {detail && (
        <Path
          d={gullies(m)}
          stroke={cc(SCENE.gully)}
          strokeWidth={0.6}
          strokeOpacity={0.55}
          strokeLinecap="round"
        />
      )}
      <Path d={line(m.ridge)} fill="none" {...contour} strokeWidth={0.6} strokeOpacity={0.4} />
      {detail && withTrail && (
        <Path
          d={trail(m)}
          fill="none"
          stroke={cc(SCENE.trail)}
          strokeWidth={0.8}
          strokeDasharray={[1.6, 1.3]}
          strokeLinecap="round"
          strokeOpacity={0.9}
        />
      )}
      <Path d={poly(m.outline)} fill="none" {...contour} />
      {detail && withCross && (
        <Path
          d={summitCross(m.apex)}
          stroke={cc(SCENE.cross)}
          strokeWidth={1.1}
          strokeLinecap="round"
        />
      )}
    </G>
  );
}

/** Winkel der linken Flanke (Grad) — die Schraffur folgt ihr. */
function slopeAngle(m: Mountain) {
  const [lx, ly] = m.outline[0];
  return (Math.atan2(m.apex[1] - ly, m.apex[0] - lx) * 180) / Math.PI;
}

function Meadow({ ctx, y = 200 }: { ctx: Ctx; y?: number }) {
  return (
    <Path
      d={poly([
        [-12, y + 6],
        [30, y - 3],
        [70, y + 2],
        [110, y - 4],
        [150, y + 3],
        [190, y - 4],
        [232, y + 2],
        [232, 260],
        [-12, 260],
      ])}
      fill={ctx.cc(SCENE.meadow)}
      {...contourOf(ctx.ink)}
    />
  );
}

export function Scenery({ kind, id, cc, ink, detail }: Props) {
  const ctx: Ctx = { id, cc, ink, detail, sun: kind === 'twin' ? SUN_TWIN : SUN };
  const contour = contourOf(ink);

  switch (kind) {
    case 'peak': {
      const m = mountain([110, 104], 22, 198, 216, 2.4);
      return (
        <G>
          <Sky ctx={ctx} />
          <Sun ctx={ctx} />
          <Birds ctx={ctx} />
          <Range
            ctx={ctx}
            pts={[
              [-12, 186],
              [16, 164],
              [32, 172],
              [56, 150],
              [74, 164],
              [110, 176],
              [148, 158],
              [168, 146],
              [190, 162],
              [208, 154],
              [232, 172],
              [232, 220],
              [-12, 220],
            ]}
            fill={SCENE.far}
          />
          <Range
            ctx={ctx}
            pts={[
              [-12, 204],
              [22, 184],
              [46, 192],
              [70, 180],
              [110, 198],
              [152, 180],
              [176, 190],
              [202, 176],
              [232, 192],
              [232, 230],
              [-12, 230],
            ]}
            fill={SCENE.mid}
          />
          <Peak ctx={ctx} m={m} fill={SCENE.rock} snow={27} withTrail withCross />
          <Meadow ctx={ctx} />
        </G>
      );
    }

    case 'twin': {
      const back = mountain([80, 120], 12, 146, 216, 2);
      const front = mountain([146, 108], 90, 206, 216, 2.2);
      return (
        <G>
          <Sky ctx={ctx} />
          <Sun ctx={ctx} />
          <Birds ctx={ctx} at={[40, 106]} />
          <Range
            ctx={ctx}
            pts={[
              [-12, 190],
              [20, 170],
              [40, 178],
              [62, 160],
              [96, 176],
              [120, 168],
              [140, 176],
              [232, 168],
              [232, 220],
              [-12, 220],
            ]}
            fill={SCENE.far}
          />
          <Peak ctx={ctx} m={back} fill={SCENE.rock} snow={20} />
          <Peak ctx={ctx} m={front} fill={SCENE.rockFront} snow={24} withTrail withCross />
          <Meadow ctx={ctx} />
        </G>
      );
    }

    case 'lake': {
      const waterY = 176;
      const leftWall: Pt[] = [
        [-12, 118],
        [6, 112],
        [24, 126],
        [40, 122],
        [58, 148],
        [70, 166],
        [80, waterY],
        [-12, waterY],
      ];
      const rightWall: Pt[] = [
        [232, 112],
        [210, 120],
        [194, 114],
        [176, 138],
        [162, 152],
        [146, waterY],
        [232, waterY],
      ];
      const center = mountain([112, 116], 62, 162, waterY, 1.8);
      return (
        <G>
          <Sky ctx={ctx} />
          <Sun ctx={ctx} />
          <Peak ctx={ctx} m={center} fill={SCENE.rockLake} snow={18} />
          <Range ctx={ctx} pts={leftWall} fill={SCENE.mid} />
          <Range ctx={ctx} pts={rightWall} fill={SCENE.hill} />
          <Rect x={-12} y={waterY} width={244} height={90} fill={`url(#water_${id})`} />
          {detail && (
            <G opacity={0.2}>
              <Path d={poly(mirror(center.outline, waterY))} fill={cc(SCENE.rockLake)} />
              <Path d={poly(mirror(leftWall, waterY))} fill={cc(SCENE.mid)} />
              <Path d={poly(mirror(rightWall, waterY))} fill={cc(SCENE.hill)} />
            </G>
          )}
          <Path
            d={waterLines(
              detail
                ? [
                    [30, 184, 30],
                    [92, 188, 46],
                    [52, 194, 22],
                    [128, 196, 36],
                    [20, 201, 40],
                    [84, 203, 26],
                    [150, 202, 44],
                  ]
                : [
                    [40, 190, 36],
                    [120, 198, 44],
                  ],
            )}
            stroke={cc(SCENE.waterLine)}
            strokeWidth={detail ? 0.7 : 1.4}
            strokeLinecap="round"
            strokeOpacity={0.7}
          />
          <Path d={`M-12,${waterY} H232`} {...contour} strokeOpacity={0.35} />
          {/* Kapelle am Ufer (St. Bartholomä): Mauer, Ziegeldach, zwei Zwiebeltürme */}
          <G>
            <Rect x={58} y={168} width={14} height={8} fill={cc(SCENE.wall)} {...contour} />
            <Path d="M57,168 L65,163 L73,168 Z" fill={cc(SCENE.tile)} {...contour} />
            <Circle cx={60.5} cy={164} r={2.3} fill={cc(SCENE.tile)} {...contour} />
            <Circle cx={69.5} cy={163.2} r={2.6} fill={cc(SCENE.tile)} {...contour} />
            {detail && (
              <Path
                d="M60.5,161.7 V159.6 M69.5,160.6 V158.2"
                stroke={ink}
                strokeWidth={0.6}
                strokeLinecap="round"
              />
            )}
          </G>
        </G>
      );
    }

    case 'cliff': {
      const seaY = 166;
      // Königsstuhl: Kreidekliff mit Buchenwald auf der Kante, rechts ein zweiter Felsen
      const mainTop: Pt[] = [
        [20, 150],
        [30, 136],
        [52, 128],
        [80, 125],
        [104, 128],
        [118, 136],
      ];
      const mainCliff: Pt[] = [[14, 210], ...mainTop, [122, 152], [126, 178], [132, 210]];
      const smallTop: Pt[] = [
        [154, 154],
        [164, 144],
        [190, 139],
        [214, 140],
        [232, 146],
      ];
      const smallCliff: Pt[] = [[150, 210], ...smallTop, [232, 210]];
      return (
        <G>
          <Sky ctx={ctx} />
          <Sun ctx={ctx} />
          <Birds ctx={ctx} at={[60, 104]} />
          <Rect x={-12} y={seaY} width={244} height={100} fill={`url(#water_${id})`} />
          <Path
            d={waterLines(
              detail
                ? [
                    [136, 172, 12],
                    [134, 182, 14],
                    [138, 194, 10],
                    [-10, 180, 20],
                    [-8, 196, 16],
                  ]
                : [[134, 184, 14]],
            )}
            stroke={cc(SCENE.waterLine)}
            strokeWidth={detail ? 0.7 : 1.4}
            strokeLinecap="round"
            strokeOpacity={0.7}
          />
          <Path d={`M-12,${seaY} H232`} {...contour} strokeOpacity={0.35} />
          {detail && (
            <G>
              <Path d="M140,163 L140,151 L146,162 Z" fill={cc(SCENE.sail)} {...contour} />
              <Path d="M136,163 H149 L146.5,165.6 H138.5 Z" fill={cc(SCENE.tile)} {...contour} />
            </G>
          )}
          {/* Kreidefelsen: Licht von rechts, Schattenkante links, feine Klüfte */}
          <Path d={poly(smallCliff)} fill={cc(SCENE.chalk)} {...contour} />
          <Path
            d={poly([
              [150, 210],
              [154, 154],
              [164, 144],
              [168, 172],
              [164, 210],
            ])}
            fill={cc(SCENE.chalkShade)}
          />
          <Path d={poly(mainCliff)} fill={cc(SCENE.chalk)} />
          <Path
            d={poly([
              [14, 210],
              [20, 150],
              [30, 136],
              [40, 132],
              [34, 170],
              [38, 210],
            ])}
            fill={cc(SCENE.chalkShade)}
          />
          {detail && (
            <Path
              d="M52,138 L49,176 M66,134 L67,186 M80,134 L78,170 M94,136 L97,190 M108,140 L111,184 M174,150 L172,182 M190,146 L192,190 M206,148 L204,178 M220,150 L222,186"
              stroke={cc(SCENE.fissure)}
              strokeWidth={0.55}
              strokeLinecap="round"
              strokeOpacity={0.85}
            />
          )}
          <Path d={poly(mainCliff)} fill="none" {...contour} />
          <Path d={crownsAlong(mainTop, 4.4, 5)} fill={cc(SCENE.beech)} {...contour} />
          <Path d={crownsAlong(smallTop, 4, 5)} fill={cc(SCENE.beech)} {...contour} />
        </G>
      );
    }

    case 'forest': {
      // Schwarzwald: Kuppen, dunkle Waldkante, vorn gestufte Tannen
      const front: [number, number, number][] = [
        [30, 202, 36],
        [58, 205, 28],
        [84, 200, 44],
        [112, 204, 32],
        [140, 199, 46],
        [168, 205, 30],
        [194, 202, 38],
      ];
      return (
        <G>
          <Sky ctx={ctx} />
          <Sun ctx={ctx} />
          <Range
            ctx={ctx}
            pts={[
              [-12, 168],
              [24, 150],
              [56, 158],
              [92, 138],
              [126, 152],
              [160, 140],
              [196, 150],
              [232, 140],
              [232, 220],
              [-12, 220],
            ]}
            fill={SCENE.far}
          />
          <Path
            d={treeline(-12, 232, 166, 6.5, 8, 214)}
            fill={cc(SCENE.firBack)}
            {...contour}
            strokeOpacity={0.3}
          />
          <Range
            ctx={ctx}
            pts={[
              [-12, 192],
              [40, 178],
              [96, 186],
              [150, 176],
              [196, 184],
              [232, 178],
              [232, 230],
              [-12, 230],
            ]}
            fill={SCENE.hill}
          />
          {front.map(([x, b]) => (
            <Rect key={x} x={x - 1.3} y={b - 1} width={2.6} height={4} fill={cc(SCENE.trunk)} />
          ))}
          <Path
            d={front.map(([x, b, h]) => fir(x, b, h)).join(' ')}
            fill={cc(SCENE.fir)}
            {...contour}
            strokeOpacity={0.45}
          />
        </G>
      );
    }

    case 'tower': {
      // Kirch-, Tor- oder Aussichtsturm auf einer Kuppe (A-D2-2) — vollständig unter dem Band
      const tx = 104;
      const tw = 16;
      const top = 122;
      const foot = 166;
      const hillPts: Pt[] = [
        [-12, 200],
        [30, 182],
        [70, 168],
        [110, 162],
        [150, 168],
        [190, 182],
        [232, 196],
        [232, 240],
        [-12, 240],
      ];
      const masonry = Array.from({ length: 6 }, (_, k) => top + 6 + k * 6.4)
        .map((y) => `M${tx + 0.6},${y.toFixed(1)} H${tx + tw - 0.6}`)
        .join(' ');
      return (
        <G>
          <Sky ctx={ctx} />
          <Sun ctx={ctx} />
          <Range
            ctx={ctx}
            pts={[
              [-12, 182],
              [20, 164],
              [44, 172],
              [72, 152],
              [104, 170],
              [140, 156],
              [172, 166],
              [204, 150],
              [232, 162],
              [232, 220],
              [-12, 220],
            ]}
            fill={SCENE.far}
          />
          <Path d={poly(hillPts)} fill={cc(SCENE.hill)} {...contour} />
          {/* Haus neben dem Turm */}
          <Rect x={120} y={150} width={24} height={15} fill={cc(SCENE.wall)} {...contour} />
          <Path d="M117,151 L132,139 L147,151 Z" fill={cc(SCENE.tile)} {...contour} />
          <Rect x={129.5} y={157} width={5} height={8} fill={cc(SCENE.window)} />
          {/* Turm mit Schattenseite, Gesims, Patina-Spitze und Knauf */}
          <Rect x={tx} y={top} width={tw} height={foot - top} fill={cc(SCENE.stone)} />
          <Rect x={tx} y={top} width={tw * 0.42} height={foot - top} fill={cc(SCENE.stoneShade)} />
          {detail && (
            <Path d={masonry} stroke={cc(SCENE.masonry)} strokeWidth={0.45} strokeOpacity={0.7} />
          )}
          <Rect
            x={tx + tw / 2 - 1.5}
            y={top + 9}
            width={3}
            height={7}
            rx={1.5}
            fill={cc(SCENE.window)}
          />
          <Rect
            x={tx + tw / 2 - 1.5}
            y={top + 24}
            width={3}
            height={6}
            rx={1.5}
            fill={cc(SCENE.window)}
          />
          <Rect x={tx} y={top} width={tw} height={foot - top} fill="none" {...contour} />
          <Rect
            x={tx - 2}
            y={top - 3}
            width={tw + 4}
            height={3.2}
            fill={cc(SCENE.stoneShade)}
            {...contour}
          />
          <Path
            d={`M${tx - 1},${top - 3} L${tx + tw / 2},${top - 25} L${tx + tw + 1},${top - 3} Z`}
            fill={cc(SCENE.patina)}
            {...contour}
          />
          <Path
            d={`M${tx + tw / 2},${top - 25} L${tx + tw / 2},${top - 3} L${tx - 1},${top - 3} Z`}
            fill={SCENE.shade}
            opacity={0.18}
          />
          <Path
            d={`M${tx + tw / 2},${top - 25} V${top - 30.5}`}
            stroke={cc(SCENE.cross)}
            strokeWidth={0.9}
            strokeLinecap="round"
          />
          <Circle cx={tx + tw / 2} cy={top - 31.5} r={1.4} fill={cc(SCENE.cross)} />
          {/* Tannen am Hang */}
          <Path
            d={`${fir(46, 184, 20)} ${fir(60, 178, 16)} ${fir(176, 182, 18)}`}
            fill={cc(SCENE.fir)}
            {...contour}
            strokeOpacity={0.4}
          />
          <Meadow ctx={ctx} y={202} />
        </G>
      );
    }
  }
}
