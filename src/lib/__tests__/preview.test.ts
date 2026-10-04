/**
 * Der Vorschau-Modus darf ausschließlich im Browser greifen (AP-D, Security):
 * Nativ wird `preview.ts` gebündelt (immer aus, keine Seed-Kopien); die echte
 * Implementierung `preview.web.ts` gilt nur mit EXPO_PUBLIC_PREVIEW=1.
 */
describe('Vorschau-Modus', () => {
  const original = process.env.EXPO_PUBLIC_PREVIEW;
  afterEach(() => {
    if (original === undefined) delete process.env.EXPO_PUBLIC_PREVIEW;
    else process.env.EXPO_PUBLIC_PREVIEW = original;
    jest.resetModules();
  });

  const loadWeb = (os: 'ios' | 'android' | 'web') => {
    jest.resetModules();
    jest.doMock('react-native', () => ({ Platform: { OS: os } }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../preview.web') as typeof import('../preview.web');
  };

  it('native Fassung ist immer aus und liefert keine Daten', async () => {
    process.env.EXPO_PUBLIC_PREVIEW = '1';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const native = require('../preview') as typeof import('../preview');
    expect(native.isPreview).toBe(false);
    await expect(native.previewUnlock('zugspitze')).rejects.toThrow();
  });

  it.each(['ios', 'android'] as const)(
    'Web-Fassung bleibt auf %s aus, auch mit Variable',
    async (os) => {
      process.env.EXPO_PUBLIC_PREVIEW = '1';
      const web = loadWeb(os);
      expect(web.isPreview).toBe(false);
      await expect(web.previewFetchPlaces()).rejects.toThrow();
    },
  );

  it('gilt im Browser nur mit EXPO_PUBLIC_PREVIEW=1', () => {
    process.env.EXPO_PUBLIC_PREVIEW = '1';
    expect(loadWeb('web').isPreview).toBe(true);
    process.env.EXPO_PUBLIC_PREVIEW = '';
    expect(loadWeb('web').isPreview).toBe(false);
  });

  it('liefert im Browser die 15 Seed-Orte, höchste zuerst', async () => {
    process.env.EXPO_PUBLIC_PREVIEW = '1';
    const places = await loadWeb('web').previewFetchPlaces();
    expect(places).toHaveLength(15);
    expect(places[0].id).toBe('zugspitze');
  });
});
