/** Zentrale deutsche UI-Texte (CLAUDE.md: keine verstreuten Hardcodes). Tonalität: Website. */
export const de = {
  tabs: {
    karte: 'Karte',
    orte: 'Orte',
    sammlung: 'Sammlung',
  },
  orte: {
    eyebrow: 'Alle Ziele',
    title: 'Orte',
    filterAlle: 'Alle',
    filterOffen: 'Noch offen',
    filterErwandert: 'Erwandert',
    statusErwandert: 'Erwandert',
    statusVerschlossen: 'Liegt noch im Nebel',
    leer: 'Keine Orte in dieser Auswahl.',
    laden: 'Die Karte wird entrollt …',
    fehler: 'Die Orte konnten nicht geladen werden.',
    nochmal: 'Nochmal versuchen',
  },
  detail: {
    zurueck: 'Orte',
    erwandertAm: (datum: string) => `Erwandert am ${datum} · in Messing geprägt`,
    nochNichtErwandert: 'Noch nicht erwandert — sei vor Ort, um dieses Schild zu prägen.',
    entfernungFolgt: 'Entfernung wird mit der Standortprüfung verfügbar.',
    shopTeaser: 'Als Stocknagel bestellen — bald verfügbar',
    nichtGefunden: 'Dieser Ort liegt noch im Nebel.',
  },
  karte: {
    fogLabel: '? ? ?',
    chipVerschlossen: 'Verschlossen',
    chipNebel: 'Noch im Nebel',
    sheetDetails: 'Details ansehen',
    sheetVerschlossen: 'Noch nicht erwandert',
    locateLabel: 'Eigener Standort',
    laden: 'Die Karte wird entrollt …',
  },
  platzhalter: {
    sammlungEyebrow: 'Dein Wanderstock',
    sammlungTitle: 'Sammlung',
    sammlungBody: 'Hier versammeln sich deine geprägten Stockschilder — Gipfel um Gipfel.',
  },
} as const;
