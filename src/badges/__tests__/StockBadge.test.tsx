import { render } from '@testing-library/react-native';

import { StockBadge, type StockBadgeProps } from '../StockBadge';

/** Badge-Konfigurationen der 8 MVP-Orte (Quelle: supabase/migrations/…_seed_places.sql). */
const PLACES: StockBadgeProps[] = [
  { name: 'Zugspitze', region: 'Wettersteingebirge', elevationM: 2962, motif: 'peak', shape: 'shield', tone: 'brass' },
  { name: 'Watzmann', region: 'Berchtesgadener Alpen', elevationM: 2713, motif: 'twin', shape: 'shield', tone: 'brass' },
  { name: 'Königssee', region: 'Berchtesgaden', elevationM: 603, motif: 'lake', shape: 'arch', tone: 'brass' },
  { name: 'Brocken', region: 'Harz', elevationM: 1141, motif: 'tower', shape: 'oval', tone: 'pewter' },
  { name: 'Feldberg', region: 'Schwarzwald', elevationM: 1493, motif: 'forest', shape: 'oval', tone: 'copper' },
  { name: 'Königsstuhl', region: 'Rügen · Jasmund', elevationM: 118, motif: 'cliff', shape: 'arch', tone: 'silver' },
  { name: 'Gr. Arber', region: 'Bayerischer Wald', elevationM: 1456, motif: 'peak', shape: 'shield', tone: 'pewter' },
  { name: 'Wendelstein', region: 'Mangfallgebirge', elevationM: 1838, motif: 'tower', shape: 'shield', tone: 'copper' },
];

// useId in Snapshots stabil halten (Gradient-/Clip-IDs)
let mockIdCounter = 0;
jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react');
  return { ...actual, useId: () => `test${mockIdCounter++}` };
});

beforeEach(() => {
  mockIdCounter = 0;
});

/** Sammelt einen Prop-Wert rekursiv aus dem gerenderten JSON-Baum. */
function collectProp(node: unknown, prop: string, acc: unknown[] = []): unknown[] {
  if (Array.isArray(node)) {
    node.forEach((child) => collectProp(child, prop, acc));
  } else if (node && typeof node === 'object') {
    const n = node as { props?: Record<string, unknown>; children?: unknown };
    if (n.props && prop in n.props) acc.push(n.props[prop]);
    collectProp(n.children, prop, acc);
  }
  return acc;
}

describe('StockBadge', () => {
  it.each(PLACES.map((p) => [p.name, p] as const))('rendert %s pixel-stabil', async (_name, place) => {
    const tree = (await render(<StockBadge {...place} />)).toJSON();
    expect(tree).not.toBeNull();
    expect(tree).toMatchSnapshot();
  });

  it('rendert die Locked-Variante (entsättigt, Opacity 0.62)', async () => {
    const tree = (await render(<StockBadge {...PLACES[7]} locked />)).toJSON();
    expect(tree).not.toBeNull();
    expect(collectProp(tree, 'opacity')).toContain(0.62);
    expect(tree).toMatchSnapshot();
  });

  it('skaliert die Schrift nach Namenslänge wie badges.js', async () => {
    const sizes = (tree: unknown) =>
      collectProp(tree, 'font').map((f) => (f as { fontSize?: number }).fontSize);
    const short = (await render(<StockBadge {...PLACES[3]} />)).toJSON(); // "Brocken" (7) → 19.5
    expect(sizes(short)).toContain(19.5);
    const long = (await render(<StockBadge {...PLACES[5]} />)).toJSON(); // "Königsstuhl" (11) → 17
    expect(sizes(long)).toContain(17);
  });

  it('zeigt Name (uppercase), Region und Höhe', async () => {
    // SVG-Texte landen als `content` auf RNSVGTSpan-Knoten
    const tree = (await render(<StockBadge {...PLACES[0]} />)).toJSON();
    const texts = collectProp(tree, 'content').filter((c) => typeof c === 'string');
    expect(texts.filter((t) => t === 'ZUGSPITZE')).toHaveLength(2); // zweilagige Gravur
    expect(texts).toContain('WETTERSTEINGEBIRGE');
    expect(texts).toContain('2962 m');
  });
});
