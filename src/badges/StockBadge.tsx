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

import type { BadgeMotif, BadgeShape } from '@/lib/places';
import { badgeTones, fonts, type BadgeTone } from '@/theme';

import { CENTER, NAILS, SHAPES, VIEWBOX } from './geometry';
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
  /** Render-Breite in dp; Höhe folgt dem Seitenverhältnis 220:252. */
  width?: number;
};

/**
 * Ein Stockschild — Portierung von `badge()` aus `wanderlust/badges.js`
 * nach react-native-svg. Geometrie, Farben und Schriftgrößen 1:1;
 * Abweichungen sind in docs/AP2-Plan.md unter „Annahmen" dokumentiert.
 */
export function StockBadge({
  name,
  region,
  elevationM,
  motif,
  shape,
  tone,
  locked = false,
  width = 184,
}: StockBadgeProps) {
  const id = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const cc = locked ? lockedColor : identityColor;
  const t = badgeTones[tone];
  const c = { hi: cc(t.hi), mid: cc(t.mid), lo: cc(t.lo), edge: cc(t.edge) };
  const shapeD = SHAPES[shape];
  const nails = NAILS[shape];
  const { x: cx, y: cy } = CENTER;

  // Schriftgrößen-Logik aus badges.js (Namenslänge)
  const nameFs = name.length > 9 ? 17 : name.length > 6 ? 19.5 : 23;
  const nameLs = name.length > 9 ? 0.6 : 1.1;
  const elevation = `${elevationM} m`;

  return (
    <Svg
      width={width}
      height={(width * VIEWBOX.height) / VIEWBOX.width}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      accessibilityRole="image"
      accessibilityLabel={`Stockschild ${name}, ${elevation}`}
    >
      <Defs>
        <RadialGradient id={`frame_${id}`} cx="38%" cy="30%" r="80%">
          <Stop offset="0%" stopColor={c.hi} />
          <Stop offset="48%" stopColor={c.mid} />
          <Stop offset="100%" stopColor={c.lo} />
        </RadialGradient>
        <LinearGradient id={`band_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={c.hi} />
          <Stop offset="40%" stopColor={c.mid} />
          <Stop offset="100%" stopColor={c.lo} />
        </LinearGradient>
        <LinearGradient id={`sky_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={cc('#c4dbe4')} />
          <Stop offset="60%" stopColor={cc('#dce7e0')} />
          <Stop offset="100%" stopColor={cc('#eef0e6')} />
        </LinearGradient>
        <LinearGradient id={`water_${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={cc('#7fb1c6')} />
          <Stop offset="100%" stopColor={cc('#4d8aa6')} />
        </LinearGradient>
        <ClipPath id={`clip_${id}`}>
          <Path d={shapeD} />
        </ClipPath>
      </Defs>

      {/* Drop-Shadow der Website (feDropShadow) liefert der umgebende View — A-AP2-1 */}
      <G opacity={locked ? 0.62 : 1}>
        {/* Metallrahmen */}
        <Path
          d={shapeD}
          fill={`url(#frame_${id})`}
          stroke={c.edge}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Eingelassener Inhalt (zentriert skaliert wie im Web) */}
        <G transform={`translate(${cx} ${cy}) scale(0.88) translate(${-cx} ${-cy})`}>
          <G clipPath={`url(#clip_${id})`}>
            <Scenery kind={motif} id={id} cc={cc} />
            {/* Namensband oben */}
            <Rect x={-12} y={0} width={244} height={92} fill={`url(#band_${id})`} />
            <Rect x={-12} y={86} width={244} height={6} fill={c.edge} opacity={0.5} />
            {/* Höhenband unten */}
            <Rect x={-12} y={206} width={244} height={26} fill={`url(#band_${id})`} />
            <Rect x={-12} y={205} width={244} height={2.5} fill={c.hi} opacity={0.6} />
          </G>

          {/* Innere Haarlinien-Rahmen */}
          <Path
            d={shapeD}
            fill="none"
            stroke={c.hi}
            strokeWidth={1.4}
            opacity={0.55}
            strokeLinejoin="round"
          />
          <Path
            d={shapeD}
            fill="none"
            stroke={c.edge}
            strokeWidth={1}
            opacity={0.5}
            strokeLinejoin="round"
            transform={`translate(${cx} ${cy}) scale(0.93) translate(${-cx} ${-cy})`}
          />

          {/* Name (zweilagige Gravur) */}
          <Text
            x={110}
            y={56}
            textAnchor="middle"
            fontFamily={fonts.displaySemiBold}
            fontSize={nameFs}
            letterSpacing={nameLs}
            fill={c.hi}
            opacity={0.5}
          >
            {name.toUpperCase()}
          </Text>
          <Text
            x={110}
            y={55}
            textAnchor="middle"
            fontFamily={fonts.displaySemiBold}
            fontSize={nameFs}
            letterSpacing={nameLs}
            fill={c.edge}
          >
            {name.toUpperCase()}
          </Text>
          <Text
            x={110}
            y={74}
            textAnchor="middle"
            fontFamily={fonts.mono}
            fontSize={8.5}
            letterSpacing={1.5}
            fill={c.edge}
            opacity={0.82}
          >
            {region.toUpperCase()}
          </Text>
          {/* Höhe */}
          <Text
            x={110}
            y={224}
            textAnchor="middle"
            fontFamily={fonts.monoMedium}
            fontSize={11}
            letterSpacing={2}
            fill={c.edge}
          >
            {elevation}
          </Text>
        </G>

        {/* Nietenköpfe */}
        {nails.map(([nx, ny]) => (
          <G key={`${nx}-${ny}`}>
            <Circle
              cx={nx}
              cy={ny}
              r={5.2}
              fill={`url(#frame_${id})`}
              stroke={c.edge}
              strokeWidth={1}
            />
            <Circle cx={nx - 1.4} cy={ny - 1.4} r={1.5} fill={cc('#ffffff')} opacity={0.55} />
          </G>
        ))}
      </G>
    </Svg>
  );
}
