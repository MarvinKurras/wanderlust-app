# Wanderlust App

Mobile Wander-App (Expo / React Native / TypeScript): Nutzer schalten digitale **Stocknägel** für real besuchte Orte frei — die App prüft per GPS, ob sie wirklich dort waren.

- Projektplan: [`docs/Wanderlust-App-Projektplan.md`](docs/Wanderlust-App-Projektplan.md)
- Projektregeln & Architekturentscheidungen: [`CLAUDE.md`](CLAUDE.md)
- Design-/Content-Referenz (read-only): Repo [`marvinkurras/wanderlust`](https://github.com/marvinkurras/wanderlust)

## Entwicklung

```sh
npm install
# einmalig: .env mit den öffentlichen Supabase-Client-Werten anlegen
# (Inhalt siehe docs/Supabase-Setup.md, Vorlage .env.example)
npx expo start        # Dev-Server (Dev Client empfohlen; Expo Go aus dem App Store hinkt neuen SDKs teils hinterher)
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Jest: Badge-Snapshots, Geo-, Regionen- und Bühnen-Logik
npm run preview:web   # Web-Vorschau mit Beispieldaten (Browser, auch am Handy im WLAN)
```

Zielplattformen: iOS 16.4+ und Android 8+ (minSdk 26). Web ist kein Produktziel — die Web-Vorschau dient nur dem Durchklicken des Designs: lokale Seed-Daten, simulierte Prägung, gezeichnete Karte statt Apple/Google Maps; Liquid Glass, Messingglanz (Skia), Neigung und Haptik gibt es nur auf dem Gerät.

## Struktur

```
src/app/         Screens (Expo Router): Tabs Karte · Orte · Sammlung, Ort-Detail, Onboarding, Einstellungen
src/components/  Design-System: Glas, Buttons, Glyphen, Tab-Leiste, Kopfzeilen, Sheet, Dialog
src/components/atmosphere/  Bergbühne der Website (Ketten, Himmel, Nebel, Korn)
src/badges/      Stockschilder (pixel-treu zur Website) + Messingglanz und Nebel
src/features/    Feature-Logik und -UI (map, places, unlock, collection, onboarding, account)
src/lib/         Supabase-Datenzugriff, Geo/Format, Bewegung, Haptik, Neigung, Web-Vorschau
src/theme/       Design-Tokens (Farben, Typografie, Spacing, Glas, Karte, Bühne) — Quelle: Website
assets/brand/    SVG-Quellen für Icons (aus dem Website-Favicon abgeleitet)
assets/images/   Generierte App-Icons/Splash (vorläufig, final in AP9)
docs/            Projektplan und AP-Pläne
```

Hinweis: Die App-Icons sind vorläufige Renderings der SVGs in `assets/brand/` (einmalig mit `sharp` erzeugt); finale Store-Icons entstehen in AP9.
