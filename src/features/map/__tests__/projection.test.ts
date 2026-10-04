import { graticuleStep, makeProjection, metersToPixels, project } from '../projection';

const viewport = { width: 400, height: 800 };

describe('Web-Vorschau-Projektion', () => {
  const region = { latitude: 50, longitude: 10, latitudeDelta: 4, longitudeDelta: 4 };
  const projection = makeProjection(region, viewport);

  it('legt das Zentrum in die Bildmitte', () => {
    expect(project(50, 10, projection, viewport)).toEqual({ x: 200, y: 400 });
  });

  it('passt den Ausschnitt vollständig ein (Breite begrenzt bei Hochformat)', () => {
    const left = project(50, 8, projection, viewport);
    const right = project(50, 12, projection, viewport);
    expect(left.x).toBeCloseTo(0);
    expect(right.x).toBeCloseTo(400);
    const top = project(52, 10, projection, viewport);
    expect(top.y).toBeGreaterThan(0); // Höhe hat Luft
  });

  it('Norden liegt oben', () => {
    expect(project(51, 10, projection, viewport).y).toBeLessThan(400);
  });

  it('rechnet Meter in Pixel um', () => {
    const px = metersToPixels(111320, projection); // ≈ 1 Breitengrad
    expect(px).toBeCloseTo(projection.scale / projection.cosLat);
  });

  it('wählt ein gröberes Gradnetz für große Ausschnitte', () => {
    expect(graticuleStep(9)).toBeGreaterThan(graticuleStep(0.05));
  });
});
