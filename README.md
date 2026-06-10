# Wanderlust App

Mobile Wander-App (Expo / React Native / TypeScript): Nutzer schalten digitale **Stocknägel** für real besuchte Orte frei — die App prüft per GPS, ob sie wirklich dort waren.

- Projektplan: [`docs/Wanderlust-App-Projektplan.md`](docs/Wanderlust-App-Projektplan.md)
- Projektregeln & Architekturentscheidungen: [`CLAUDE.md`](CLAUDE.md)
- Design-/Content-Referenz (read-only): Repo [`marvinkurras/wanderlust`](https://github.com/marvinkurras/wanderlust)

## Entwicklung

```sh
npm install
npx expo start        # Dev-Server (Expo Go oder Dev Client)
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
```

Zielplattformen: iOS 16.4+ und Android 8+ (minSdk 26). Web ist kein Ziel.

## Struktur

```
src/app/         Screens (Expo Router): Tabs Karte · Orte · Sammlung
src/components/  Geteilte UI-Bausteine
src/theme/       Design-Tokens (Farben, Typografie, Spacing) — Quelle: Website
assets/brand/    SVG-Quellen für Icons (aus dem Website-Favicon abgeleitet)
assets/images/   Generierte App-Icons/Splash (vorläufig, final in AP9)
docs/            Projektplan und AP-Pläne
```

Hinweis: Die App-Icons sind vorläufige Renderings der SVGs in `assets/brand/` (einmalig mit `sharp` erzeugt); finale Store-Icons entstehen in AP9.
