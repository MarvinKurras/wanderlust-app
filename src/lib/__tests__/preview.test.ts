/**
 * Der Vorschau-Modus darf ausschließlich im Browser greifen (AP-D, Security):
 * Selbst mit gesetzter Variable bleibt er auf iOS/Android aus, damit dort nie
 * lokale Daten oder eine simulierte Prägung an die Stelle des Servers treten.
 */
describe('isPreview', () => {
  const original = process.env.EXPO_PUBLIC_PREVIEW;
  afterEach(() => {
    process.env.EXPO_PUBLIC_PREVIEW = original;
    jest.resetModules();
  });

  const load = (os: 'ios' | 'android' | 'web') => {
    jest.resetModules();
    jest.doMock('react-native', () => ({ Platform: { OS: os } }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../preview') as typeof import('../preview');
  };

  it.each(['ios', 'android'] as const)(
    'bleibt auf %s aus, auch mit EXPO_PUBLIC_PREVIEW=1',
    (os) => {
      process.env.EXPO_PUBLIC_PREVIEW = '1';
      expect(load(os).isPreview).toBe(false);
    },
  );

  it('gilt im Browser nur mit EXPO_PUBLIC_PREVIEW=1', () => {
    process.env.EXPO_PUBLIC_PREVIEW = '1';
    expect(load('web').isPreview).toBe(true);
    process.env.EXPO_PUBLIC_PREVIEW = '';
    expect(load('web').isPreview).toBe(false);
  });

  it('liefert die 15 Seed-Orte, höchste zuerst', async () => {
    process.env.EXPO_PUBLIC_PREVIEW = '1';
    const preview = load('web');
    const places = await preview.previewFetchPlaces();
    expect(places).toHaveLength(15);
    expect(places[0].id).toBe('zugspitze');
  });
});
