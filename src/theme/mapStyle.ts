/**
 * Kartenfarben (AP-D, A-D-3). Quelle: die gemalte Deutschland-Karte der Website
 * (`wanderlust/map/terrain.js`: seaFill, landFill, Massive, Flüsse, Messing-Kanten).
 * Android bekommt daraus einen Google-Maps-Stil, die Web-Vorschau malt damit.
 * iOS nutzt `mutedStandard` — Apple-Karten lassen sich nicht frei einfärben.
 */
export const mapPaint = {
  land: '#e9dcc1',
  landLow: '#e2d2b1',
  green: '#c9d0a8',
  greenDeep: '#bcc79a',
  water: '#a7c0c6',
  waterDeep: '#8ba7b3',
  river: '#86a7b4',
  road: '#f3ead4',
  roadEdge: '#cdbd94',
  highway: '#e7d9bd',
  highwayEdge: '#b39b66',
  border: '#9c7637',
  label: '#3c4a40',
  labelHalo: '#efe4cb',
  graticule: '#cbb98c',
} as const;

type MapStyleRule = {
  featureType?: string;
  elementType?: string;
  stylers: Record<string, string | number>[];
};

/** Pergament-Stil für Google Maps (Android, `customMapStyle`). */
export const androidMapStyle: MapStyleRule[] = [
  { elementType: 'geometry', stylers: [{ color: mapPaint.land }] },
  { elementType: 'labels.text.fill', stylers: [{ color: mapPaint.label }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: mapPaint.labelHalo }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: mapPaint.border }, { weight: 0.8 }],
  },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: mapPaint.landLow }],
  },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry',
    stylers: [{ color: mapPaint.green }],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: mapPaint.greenDeep }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: mapPaint.road }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: mapPaint.roadEdge }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: mapPaint.highway }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: mapPaint.highwayEdge }],
  },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: mapPaint.water }] },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: mapPaint.waterDeep }],
  },
];
