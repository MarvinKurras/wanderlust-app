import { directionsUrl } from '../directions';

describe('directionsUrl', () => {
  it('öffnet auf iOS Apple Maps mit Fußweg', () => {
    expect(directionsUrl(49.4711, 8.6075, 'ios')).toBe(
      'http://maps.apple.com/?daddr=49.4711,8.6075&dirflg=w',
    );
  });

  it('öffnet sonst Google Maps mit Fußweg', () => {
    expect(directionsUrl(49.4711, 8.6075, 'android')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=49.4711%2C8.6075&travelmode=walking',
    );
  });
});
