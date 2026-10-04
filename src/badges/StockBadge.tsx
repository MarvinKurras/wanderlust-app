import { useId } from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text,
} from 'react-native-svg';

import { de } from '@/i18n/de';
import type { BadgeMotif, BadgeShape } from '@/lib/places';
import { badgeScene as SCENE, badgeTones, fonts, type BadgeTone } from '@/theme';

import { fitBand, fitName, fitRegion } from './fitName';
import { CENTER, FIELD_SCALE, fieldHalfWidth, NAILS, SHAPES, VIEWBOX } from './geometry';
import { identityColor, lockedColor } from './lockedColor';
import { Scenery } from './Scenery';

export type StockBadgeProps = {
  name: string;
  region: string;
  /** Höhe in Metern; gerendert als „2962 m" wie auf der Website. */
  elevationM: number;
  motif: BadgeMotif;
  shape: BadgeShape;
  tone: BadgeTone;
  /** Noch nicht erwandert: entsättigt/abgedunkelt (Annahme A-AP2-2). */
  locked?: boolean;
  /** Text im unteren Band; Default ist die Höhe („2962 m"). */
  bandLabel?: string;
  /** Render-Breite in dp; Höhe folgt dem Seitenverhältnis 220:252. */
  width?: number;
};

/** Unter dieser Breite (dp) entfallen Feinheiten, die nur flimmern würden (A-D2-4). */
export const DETAIL_MIN_WIDTH = 100;
/** Haarlinien (Schraffur, Himmel, Mauerwerk, Klüfte) erst ab hier — sonst unter 1 px (A-D2-4). */
export const FINE_MIN_WIDTH = 140;

/** Skalierung um den Schild-Mittelpunkt (für Rand, Perlrand und Feld). */
const inset = (s: number) =>
  `translate(${CENTER.x} ${CENTER.y}) scale(${s}) translate(${-CENTER.x} ${-CENTER.y})`;

/** Kleine Raute (Trenner/Ornament). */
const diamond = (x: number, y: number, r: number) =>
  `M${x},${y - r} L${x + r},${y} L${x},${y + r} L${x - r},${y} Z`;

/**
 * Ein Stocknagel (AP-D2): gestanzte Metallplakette mit erhabenem Rand,
 * Perlrand, eingelassenem Emaille-Feld und gravierter Schrift — veredelte
 * Weiterentwicklung von `badge()` aus `wanderlust/badges.js` (A-D2-1).
 * Formen, Metalltöne und Motive sind dieselben wie auf der Website.
 */
export function StockBadge({
  name,
  region,
  elevationM,
  motif,
  shape,
  tone,
  locked = false,
  bandLabel,
  width = 184,
}: StockBadgeProps) {
  const id = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const detail = width >= DETAIL_MIN_WIDTH;
  const fine = width >= FINE_MIN_WIDTH;
  const cc = locked ? lockedColor : identityColor;
  const t = badgeTones[tone];
  const c = { hi: cc(t.hi), mid: cc(t.mid), lo: cc(t.lo), edge: cc(t.edge) };
  const shapeD = SHAPES[shape];
  const nails = NAILS[shape];

  const layout = fitName(name, shape);
  const regionFit = fitRegion(region.toUpperCase(), shape, layout);
  // Mono-Labels in Versalien; die Höheneinheit bleibt klein („2962 m")
  const elevation = bandLabel?.toUpperCase() ?? `${elevationM} m`;
  const band = fitBand(elevation, shape);

  // Trennlinie unter einzeiligem Namen, so breit wie die Form dort erlaubt
  const divider =
    layout.dividerY == null
      ? null
      : { y: layout.dividerY, w: Math.min(30, fieldHalfWidth(shape, layout.dividerY) - 16) };
  // Rauten neben der Höhe, nur wenn das schmale Schildende Platz lässt
  const ornamentX = detail ? band.ornamentX : null;

  // Gravur: Lichtkante unter der Schrift — klein nicht sichtbar, also weglassen
  const engraved = (text: string, x: number, y: number, props: Record<string, unknown>) => (
    <G>
      {detail && (
        <Text x={x} y={y + 0.9} textAnchor="middle" fill={c.hi} opacity={0.55} {...props}>
          {text}
        </Text>
      )}
      <Text x={x} y={y} textAnchor="middle" fill={c.edge} {...props}>
        {text}
      </Text>
    </G>
  );

  return (
    <Svg
      width={width}
      height={(width * VIEWBOX.height) / VIEWBOX.width}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      accessibilityRole="image"
      accessibilityLabel={de.schild.label(name, elevation, !locked)}
    >
      <Defs>
        {/* Gebürstetes Metall: Licht von links oben, Spiegelung in der Mitte */}
        <LinearGradient id={`frame_${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.hi} />
          <Stop offset="0.38" stopColor={c.mid} />
          <Stop offset="0.55" stopColor={c.hi} stopOpacity={0.9} />
          <Stop offset="0.72" stopColor={c.mid} />
          <Stop offset="1" stopColor={c.lo} />
        </LinearGradient>
        <LinearGradient id={`band_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.hi} />
          <Stop offset="0.45" stopColor={c.mid} />
          <Stop offset="1" stopColor={c.lo} />
        </LinearGradient>
        <RadialGradient id={`nail_${id}`} cx="35%" cy="30%" r="75%">
          <Stop offset="0" stopColor={c.hi} />
          <Stop offset="0.55" stopColor={c.mid} />
          <Stop offset="1" stopColor={c.lo} />
        </RadialGradient>
        <LinearGradient id={`sky_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={cc(SCENE.skyTop)} />
          <Stop offset="0.55" stopColor={cc(SCENE.skyMid)} />
          <Stop offset="1" stopColor={cc(SCENE.skyLow)} />
        </LinearGradient>
        <LinearGradient id={`water_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={cc(SCENE.waterTop)} />
          <Stop offset="1" stopColor={cc(SCENE.waterBottom)} />
        </LinearGradient>
        <ClipPath id={`clip_${id}`}>
          <Path d={shapeD} />
        </ClipPath>
      </Defs>

      {/* Drop-Shadow liefert der umgebende View (BadgeArt) — A-AP2-1 */}
      <G opacity={locked ? 0.62 : 1}>
        {/* Plakette mit erhabenem Rand: dunkle Außenkante, Lichtkante innen */}
        <Path
          d={shapeD}
          fill={`url(#frame_${id})`}
          stroke={c.edge}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <Path
          d={shapeD}
          fill="none"
          stroke={c.hi}
          strokeWidth={0.9}
          strokeOpacity={0.75}
          strokeLinejoin="round"
          transform={inset(0.975)}
        />
        {detail && (
          <G>
            {/* Perlrand: gestrichelte Kontur mit runden Kappen, Glanzpunkt versetzt */}
            <Path
              d={shapeD}
              fill="none"
              stroke={c.lo}
              strokeWidth={2.3}
              strokeDasharray={[0.3, 5.1]}
              strokeLinecap="round"
              transform={inset(0.94)}
            />
            <Path
              d={shapeD}
              fill="none"
              stroke={c.hi}
              strokeWidth={0.9}
              strokeOpacity={0.8}
              strokeDasharray={[0.3, 5.1]}
              strokeLinecap="round"
              transform={`translate(-0.35 -0.4) ${inset(0.94)}`}
            />
          </G>
        )}
        {/* Stufe ins eingelassene Feld */}
        <Path
          d={shapeD}
          fill="none"
          stroke={c.edge}
          strokeWidth={1.3}
          strokeOpacity={0.7}
          strokeLinejoin="round"
          transform={inset(0.905)}
        />

        <G transform={inset(FIELD_SCALE)}>
          <G clipPath={`url(#clip_${id})`}>
            <Scenery kind={motif} id={id} cc={cc} ink={c.edge} detail={detail} fine={fine} />

            {/* Namensband als Kartusche: Lichtlippe unten, Schlagschatten aufs Bild */}
            <Rect x={-12} y={0} width={244} height={87} fill={`url(#band_${id})`} />
            <Rect x={-12} y={85.6} width={244} height={0.9} fill={c.hi} opacity={0.55} />
            <Rect x={-12} y={86.5} width={244} height={2.2} fill={c.edge} opacity={0.55} />

            {/* Höhenband bis zur Spitze: Schatten darüber, Lichtlippe oben */}
            <Rect x={-12} y={204} width={244} height={1.6} fill={c.edge} opacity={0.4} />
            <Rect x={-12} y={205.6} width={244} height={60} fill={`url(#band_${id})`} />
            <Rect x={-12} y={205.6} width={244} height={0.9} fill={c.hi} opacity={0.7} />
          </G>

          {/* Kante des Emaille-Feldes */}
          <Path
            d={shapeD}
            fill="none"
            stroke={c.edge}
            strokeWidth={1}
            strokeOpacity={0.8}
            strokeLinejoin="round"
          />

          {/* Name (graviert, bis zwei Zeilen) */}
          {layout.lines.map((text, i) => (
            <G key={text}>
              {engraved(text, CENTER.x, layout.baselines[i], {
                fontFamily: fonts.displaySemiBold,
                fontSize: layout.fontSize,
                letterSpacing: layout.letterSpacing,
              })}
            </G>
          ))}
          {divider && divider.w > 6 && (
            <G>
              <Path
                d={`M${CENTER.x - divider.w},${divider.y} H${CENTER.x - 5} M${CENTER.x + 5},${divider.y} H${CENTER.x + divider.w}`}
                stroke={c.edge}
                strokeWidth={0.6}
                strokeOpacity={0.7}
              />
              <Path d={diamond(CENTER.x, divider.y, 2.2)} fill={c.edge} opacity={0.8} />
            </G>
          )}
          {/* Region — klein (< 100 dp) ohnehin unlesbar, dann weggelassen */}
          {detail && (
            <Text
              x={CENTER.x}
              y={layout.regionBaseline}
              textAnchor="middle"
              fontFamily={fonts.mono}
              fontSize={regionFit.fontSize}
              letterSpacing={regionFit.letterSpacing}
              fill={c.edge}
              opacity={0.85}
            >
              {regionFit.text}
            </Text>
          )}

          {/* Höhe */}
          {engraved(elevation, CENTER.x, band.baseline, {
            fontFamily: fonts.monoMedium,
            fontSize: band.fontSize,
            letterSpacing: band.letterSpacing,
          })}
          {ornamentX != null && (
            <Path
              d={`${diamond(CENTER.x - ornamentX, band.baseline - 3.6, 1.8)} ${diamond(CENTER.x + ornamentX, band.baseline - 3.6, 1.8)}`}
              fill={c.edge}
              opacity={0.75}
            />
          )}
        </G>

        {/* Nieten: kugelig mit Glanzpunkt */}
        {nails.map(([nx, ny]) => (
          <G key={`${nx}-${ny}`}>
            <Circle
              cx={nx}
              cy={ny}
              r={4.5}
              fill={`url(#nail_${id})`}
              stroke={c.edge}
              strokeWidth={0.9}
            />
            {detail && (
              <Circle
                cx={nx}
                cy={ny}
                r={2.6}
                fill="none"
                stroke={c.lo}
                strokeWidth={0.5}
                strokeOpacity={0.6}
              />
            )}
            <Circle cx={nx - 1.3} cy={ny - 1.4} r={1.1} fill={cc(SCENE.glint)} opacity={0.6} />
          </G>
        ))}
      </G>
    </Svg>
  );
}
