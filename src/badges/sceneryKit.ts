/**
 * Geometrie-Bausteine der Stocknagel-Szenen (AP-D2) — reine Funktionen, die
 * SVG-Pfade liefern. Linienbündel (Schraffur, Strahlen, Rinnen …) werden zu
 * einem einzigen Pfad zusammengefasst, damit jedes Schild wenige Knoten hat.
 * Koordinaten: eingelassenes Feld der viewBox 220 × 252.
 */
export type Pt = readonly [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = ([x, y]: Pt) => `${r1(x)},${r1(y)}`;

/** Geschlossener Polygonzug. */
export function poly(pts: readonly Pt[]): string {
  return `M${pts.map(pt).join(' L')} Z`;
}

/** Offener Linienzug. */
export function line(pts: readonly Pt[]): string {
  return `M${pts.map(pt).join(' L')}`;
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** x der ersten Kreuzung eines Linienzugs mit der Höhe y (oder null). */
export function xAt(pts: readonly Pt[], y: number): number | null {
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if ((y - y0) * (y - y1) <= 0 && y0 !== y1) {
      return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
    }
  }
  return null;
}

/** Flanke mit Schultern: zwischen a und b, Stufen nach außen versetzt. */
function slope(a: Pt, b: Pt, rough: number, flip: boolean): Pt[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  // Außennormale (für beide Flanken zeigt (dy, -dx) vom Berg weg)
  const n: Pt = [dy / len, -dx / len];
  const steps: [number, number][] = flip
    ? [
        [0.2, 0.6],
        [0.26, -0.3],
        [0.47, 1],
        [0.53, -0.2],
        [0.76, 0.7],
        [0.81, -0.2],
      ]
    : [
        [0.22, 0.8],
        [0.28, -0.3],
        [0.5, 0.6],
        [0.56, -0.2],
        [0.72, 1],
        [0.78, -0.3],
      ];
  return steps.map(([t, k]) => {
    const p = lerp(a, b, t);
    return [p[0] + n[0] * rough * k, p[1] + n[1] * rough * k] as Pt;
  });
}

export type Mountain = {
  /** Umriss von links unten über den Gipfel nach rechts unten. */
  outline: Pt[];
  /** Grat vom Gipfel zum Fuß — trennt Schatten- (links) und Lichtflanke. */
  ridge: Pt[];
  apex: Pt;
};

/** Berg mit unregelmäßigen Flanken und Grat (Licht von rechts oben, A-D2-5). */
export function mountain(
  apex: Pt,
  left: number,
  right: number,
  base: number,
  rough = 2.2,
): Mountain {
  const lb: Pt = [left, base];
  const rb: Pt = [right, base];
  const w = right - left;
  const h = base - apex[1];
  const outline: Pt[] = [
    lb,
    ...slope(lb, apex, rough, false),
    apex,
    ...slope(apex, rb, rough, true),
    rb,
  ];
  const ridge: Pt[] = [
    apex,
    [apex[0] - w * 0.04, apex[1] + h * 0.28],
    [apex[0] + w * 0.015, apex[1] + h * 0.55],
    [apex[0] - w * 0.06, apex[1] + h * 0.8],
    [apex[0] - w * 0.03, base],
  ];
  return { outline, ridge, apex };
}

/** Schattenflanke: links vom Grat. */
export function shadowFace(m: Mountain): string {
  const i = m.outline.indexOf(m.apex);
  return poly([...m.outline.slice(0, i), ...m.ridge]);
}

/** Schneefeld bis `depth` unter dem Gipfel, mit gezacktem Rand und Zungen in den Rinnen. */
export function snowCap(m: Mountain, depth: number): string {
  const y0 = m.apex[1] + depth;
  const i = m.outline.indexOf(m.apex);
  const leftPart = m.outline.slice(0, i + 1);
  const rightPart = m.outline.slice(i);
  const xl = xAt(leftPart, y0);
  const xr = xAt(rightPart, y0);
  if (xl == null || xr == null) return '';
  const top = m.outline.filter((p) => p[1] < y0);
  // Zacken von rechts nach links: (Anteil der Breite, Tiefe in Anteilen von depth)
  const teeth: [number, number][] = [
    [0.12, -0.1],
    [0.22, 0.2],
    [0.33, -0.05],
    [0.42, 0.34],
    [0.52, 0.02],
    [0.62, 0.24],
    [0.72, -0.08],
    [0.83, 0.14],
    [0.92, -0.04],
  ];
  const edge: Pt[] = teeth.map(([t, k]) => [xr - (xr - xl) * t, y0 + depth * k]);
  return poly([[xl, y0], ...top, [xr, y0], ...edge]);
}

/** Felsrinnen: kurze Linien parallel zu den Flanken, Schattenseite dichter. */
export function gullies(m: Mountain): string {
  const [ax, ay] = m.apex;
  const lb = m.outline[0];
  const rb = m.outline[m.outline.length - 1];
  const h = lb[1] - ay;
  const segs: string[] = [];
  const add = (a: Pt, b: Pt) => segs.push(`M${pt(a)} L${pt(b)}`);
  // Schattenflanke: drei Rinnen vom Grat Richtung linkem Fuß
  [0.36, 0.52, 0.68].forEach((t) => {
    const s = lerp(m.apex, lerp(lb, [ax, lb[1]], 0.7), t);
    add(s, lerp(s, lb, 0.16 + t * 0.06));
  });
  // Lichtflanke: zwei feine Rinnen
  [0.42, 0.62].forEach((t) => {
    const s = lerp([ax + (rb[0] - ax) * 0.22, ay + h * 0.1], [ax + (rb[0] - ax) * 0.2, lb[1]], t);
    add(s, lerp(s, rb, 0.14));
  });
  return segs.join(' ');
}

/** Serpentinen-Pfad auf der Lichtflanke hinauf bis kurz unter den Gipfel. */
export function trail(m: Mountain, turns = 5): string {
  const [ax, ay] = m.apex;
  const i = m.outline.indexOf(m.apex);
  const rightPart = m.outline.slice(i);
  const base = m.outline[0][1];
  const yTop = ay + (base - ay) * 0.22;
  const yBot = base - 6;
  const pts: Pt[] = [];
  for (let k = 0; k <= turns; k += 1) {
    const y = yBot - ((yBot - yTop) * k) / turns;
    const ridgeX = xAt(m.ridge, y) ?? ax;
    const slopeX = xAt(rightPart, y) ?? ax;
    const inner = ridgeX + 3;
    const outer = slopeX - 5;
    pts.push([k % 2 === 0 ? outer : inner + (outer - inner) * 0.15, y]);
  }
  pts.push([ax + 1, ay + 4]);
  return line(pts);
}

/** Gipfelkreuz. */
export function summitCross([x, y]: Pt, size = 9): string {
  return `M${r1(x)},${r1(y + 0.5)} V${r1(y - size)} M${r1(x - size * 0.3)},${r1(y - size * 0.68)} H${r1(x + size * 0.3)}`;
}

/** Strahlenkranz um die Sonne. */
export function sunRays(cx: number, cy: number, r0: number, r1x: number, n = 16): string {
  const segs: string[] = [];
  for (let k = 0; k < n; k += 1) {
    const a = (Math.PI * 2 * k) / n + Math.PI / n;
    const long = k % 2 === 0 ? r1x : r0 + (r1x - r0) * 0.6;
    segs.push(
      `M${pt([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0])} L${pt([cx + Math.cos(a) * long, cy + Math.sin(a) * long])}`,
    );
  }
  return segs.join(' ');
}

/** Gravur-Schraffur des Himmels: waagrechte Linien, um die Sonne ausgespart. */
export function skyHatch(
  y0: number,
  y1: number,
  step: number,
  sun?: { cx: number; cy: number; r: number },
): string {
  const segs: string[] = [];
  for (let y = y0; y <= y1; y += step) {
    const spans: [number, number][] = [[-12, 232]];
    if (sun && Math.abs(y - sun.cy) < sun.r) {
      const dx = Math.sqrt(sun.r * sun.r - (y - sun.cy) ** 2);
      spans.splice(0, 1, [-12, sun.cx - dx], [sun.cx + dx, 232]);
    }
    spans.forEach(([a, b]) => segs.push(`M${r1(a)},${r1(y)} H${r1(b)}`));
  }
  return segs.join(' ');
}

/** Gestufte Tanne (drei Etagen, leicht hängende Zweige) als Teilpfad. */
export function fir(x: number, base: number, h: number): string {
  const tiers: [number, number, number][] = [
    [base - h, base - h * 0.5, h * 0.19],
    [base - h * 0.7, base - h * 0.22, h * 0.28],
    [base - h * 0.42, base - h * 0.02, h * 0.38],
  ];
  return tiers
    .map(
      ([top, bottom, w]) =>
        `M${r1(x)},${r1(top)} L${r1(x - w)},${r1(bottom)} Q${r1(x)},${r1(bottom - h * 0.07)} ${r1(x + w)},${r1(bottom)} Z`,
    )
    .join(' ');
}

/** Baumgrenze aus kleinen Spitzen (Waldsilhouette) bis hinunter zu `floor`. */
export function treeline(
  x0: number,
  x1: number,
  y: number,
  step: number,
  h: number,
  floor: number,
) {
  const pts: Pt[] = [
    [x0, floor],
    [x0, y],
  ];
  let k = 0;
  for (let x = x0; x < x1; x += step) {
    const var1 = [1, 0.75, 1.15, 0.9, 1.05, 0.8][k % 6];
    pts.push([x + step / 2, y - h * var1], [x + step, y]);
    k += 1;
  }
  pts.push([x1, floor]);
  return poly(pts);
}

/** Wellenlinien auf dem Wasser (Gravur): Liste [x, y, Länge]. */
export function waterLines(lines: readonly (readonly [number, number, number])[]): string {
  return lines.map(([x, y, w]) => `M${r1(x)},${r1(y)} h${r1(w)}`).join(' ');
}

/** Spiegelt einen Polygonzug an der Wasserlinie (gestaucht). */
export function mirror(pts: readonly Pt[], waterY: number, squash = 0.55): Pt[] {
  return pts.map(([x, y]) => [x, waterY + (waterY - y) * squash] as Pt);
}

/**
 * Kupferstich-Schraffur: parallele Linien im Winkel `angleDeg`, exakt auf das
 * Polygon beschnitten (Scanline in gedrehten Koordinaten, gerade-ungerade-Regel).
 */
export function hatch(pts: readonly Pt[], angleDeg: number, spacing: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  // In ein System drehen, in dem die Schraffur waagrecht liegt
  const rot = pts.map(([x, y]) => [x * cos + y * sin, -x * sin + y * cos] as Pt);
  const ys = rot.map((p) => p[1]);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const segs: string[] = [];
  for (let y = minY + spacing / 2; y < maxY; y += spacing) {
    const xs: number[] = [];
    for (let i = 0; i < rot.length; i += 1) {
      const [x0, y0] = rot[i];
      const [x1, y1] = rot[(i + 1) % rot.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        xs.push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      // zurückdrehen
      const back = (x: number): Pt => [x * cos - y * sin, x * sin + y * cos];
      segs.push(`M${pt(back(xs[k] + 0.6))} L${pt(back(xs[k + 1] - 0.6))}`);
    }
  }
  return segs.join(' ');
}

/** Punkte der Schattenflanke (für Schraffur). */
export function shadowFacePts(m: Mountain): Pt[] {
  const i = m.outline.indexOf(m.apex);
  return [...m.outline.slice(0, i), ...m.ridge];
}

/** Baumkronen (Bögen) entlang einer Kante — z. B. Buchenwald auf dem Kreidefelsen. */
export function crownsAlong(edge: readonly Pt[], r: number, depth: number): string {
  // Kante gleichmäßig abtasten
  const samples: Pt[] = [];
  for (let i = 1; i < edge.length; i += 1) {
    const a = edge[i - 1];
    const b = edge[i];
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (r * 1.5)));
    for (let k = i === 1 ? 0 : 1; k <= n; k += 1) samples.push(lerp(a, b, k / n));
  }
  let d = `M${pt(samples[0])}`;
  for (let i = 1; i < samples.length; i += 1) {
    const [x, y] = samples[i];
    const rr = r * [1, 0.85, 1.1, 0.95][i % 4];
    d += ` A${r1(rr)},${r1(rr)} 0 0,1 ${r1(x)},${r1(y)}`;
  }
  const last = samples[samples.length - 1];
  const first = samples[0];
  return `${d} L${r1(last[0])},${r1(last[1] + depth)} L${r1(first[0])},${r1(first[1] + depth)} Z`;
}
