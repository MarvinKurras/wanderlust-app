# Wanderlust App — Projektplan (MVP)

Stand: Juni 2026 · Erstellt aus der Analyse des Website-Repos `marvinkurras/wanderlust`.
Dieses Dokument ist die verbindliche Arbeitsgrundlage für die Implementierung der mobilen App in diesem Repo (`wanderlust-app`). Es enthält keine Implementierung, sondern Architektur, Datenmodell, Design-Vorgaben und Arbeitspakete.

---

## 1. App-Ziel

Wanderlust macht die Tradition der Stocknägel digital: Nutzer wandern zu realen Orten (Gipfel, Seen, Kliffs), die App prüft per GPS, ob sie wirklich dort sind, und prägt dann ein digitales Stockschild-Abzeichen. Die Sammlung wächst auf einem digitalen Wanderstock und auf einer Gipfelkarte mit Fog of War. Das MVP umfasst: Ortsliste, Ortsdetails, Kartenansicht, Geolocation-Prüfung, Freischaltung und persistente Speicherung pro Nutzer.

---

## 2. Analyse der bestehenden Webseite

### 2.1 Technischer Bestand

| Datei | Relevanz für die App |
|---|---|
| `index.html` | Design-System-Quelle (Farben, Typografie, Tonalität) |
| `badges.js` | **Stockschild-Renderer** (SVG): 3 Formen (shield/arch/oval), 4 Metalltöne (brass/silver/copper/pewter), 6 Landschaftsmotive (peak/twin/lake/cliff/forest/tower) — portierbar |
| `map/data.js` | **Die 8 Orte** mit allen Inhalten (Name, Region, Höhe, Typ, Beschreibung, Badge-Konfiguration) |
| `karte.html` + `map/app.js` | Fertiges App-Screen-Mockup: Fog of War, Pan, Ziel-Carousel, Bottom Sheet, Fortschrittsanzeige, Locate-Button — **direkte UX-Referenz** |
| `map/terrain.js` | Prozedural gemalte Deutschland-Karte (nicht georeferenziert, nur Demo) |

### 2.2 Design-Inventar

**Farben** (aus `:root` der Website, 1:1 zu übernehmen):

| Token | Wert | Verwendung |
|---|---|---|
| `ink` | `#1d2620` | Primärtext |
| `ink-soft` | `#3c4a40` | Sekundärtext |
| `paper` | `#ece1cd` | Heller Hintergrund |
| `paper-deep` | `#e3d5bb` | Sektions-/Card-Hintergrund |
| `paper-line` | `#cdbf9f` | Trennlinien |
| `pine` | `#1c2620` | Dunkler Hintergrund (Sammlung, CTA) |
| `pine-soft` | `#27332b` | Dunkle Flächen |
| `brass` | `#bb8b4b` | Akzent |
| `brass-light` | `#e9cd86` | Akzent hell (auf dunklem Grund) |
| `brass-deep` | `#7d5826` | Akzent dunkel (auf hellem Grund) |
| Metalltöne | brass/silver/copper/pewter-Gradienten aus `badges.js` `TONES` | Badge-Rahmen |

**Typografie** (Google Fonts, in der App als gebundelte Font-Dateien):
- **Cormorant** (Serif) — Display, Ortsnamen, Headlines
- **Hanken Grotesk** — Fließtext, UI
- **Spline Sans Mono** — Labels, Koordinaten, Eyebrows (uppercase, letter-spacing 1.5–3px)

**Stilmittel:** Pergament-/Messing-Welt, Grain-Overlay (~5 % Opazität), Glass-Chips (`rgba(236,225,205,.82)` + Blur), runde Pill-Buttons, dunkle „Pine"-Flächen für die Sammlung. Tonalität: Deutsch, warm, leicht poetisch („erwandert", „in Messing geprägt", „liegt noch im Nebel").

**Logo/Favicon:** Inline-SVG (Berg + Sonne auf Pine-Grund) — als App-Icon-Grundlage adaptierbar.

### 2.3 Wiederverwendbare Assets

Es gibt **keine Bilddateien** — alles ist prozedurales SVG. Übernommen werden daher nicht Dateien, sondern:
1. Die **Badge-Render-Logik** aus `badges.js` (Formen, Töne, Motive, Nieten, Gravur) → Portierung nach React Native SVG.
2. Die **Ortsdaten** aus `map/data.js` → Seed-Daten (Abschnitt 7).
3. Die **Farb-/Typo-Tokens** → Design-System der App.
4. Das Favicon-SVG → App-Icon-Entwurf.

Website-Code (Parallax, Scroll-Logik, DOM-Manipulation) wird **nicht** übernommen.

### 2.4 Annahmen & fehlende Informationen

- **A1:** Die 8 Orte aus `map/data.js` sind der MVP-Katalog. Die beworbenen „2 412 Orte" sind Marketing — weitere Orte kommen später über das Backend.
- **A2:** Die Koordinaten der Website (`47°25′N 10°59′O`) haben nur Minuten-Präzision (~1–2 km Fehler) und sind **für Geofencing unbrauchbar**. Es werden präzise Dezimalkoordinaten benötigt (Vorschlag in Abschnitt 7, vor Release zu verifizieren).
- **A3:** Die „erwandert am"-Daten der Website sind Demo-Inhalte; in der App entsteht das Datum aus der echten Freischaltung.
- **A4:** Der Stocknagel-Shop (6,90 €) ist **nicht** MVP — in der App nur als deaktivierter Hinweis/Deep-Link vorgesehen.
- **A5:** Es existiert kein Backend; es wird neu aufgesetzt (Abschnitt 3).
- **A6:** Zielmarkt Deutschland, Sprache Deutsch, iOS + Android gleichwertig.

---

## 3. Technische Architektur

**Entscheidung: React Native mit Expo (Managed Workflow), TypeScript.**
Begründung: Eine Codebasis für iOS + Android, ausgereifte Module für genau unsere Kernbedarfe (`expo-location`, Karten, `react-native-svg` für die Badge-Portierung), schnelle Iteration über EAS Build/OTA-Updates. Flutter wäre gleichwertig möglich, aber die SVG-Badge-Logik und die Web-Herkunft des Teams sprechen für das JS-Ökosystem. Keine WebView-App.

**Stack:**

| Schicht | Wahl | Begründung |
|---|---|---|
| Framework | Expo SDK (aktuell), React Native, TypeScript | s. o. |
| Navigation | Expo Router (Tabs + Stack) | dateibasiert, Standard im Expo-Ökosystem |
| Karte | `react-native-maps` (Apple Maps/Google Maps) mit Custom-Style in Paper-Tönen | geringster Integrationsaufwand im MVP; MapLibre + eigener Stil ist Ausbaustufe |
| Badges | `react-native-svg`, Portierung von `badges.js` | Badge-Sprache der Marke bleibt 1:1 erhalten |
| State | Zustand (Client-State) + TanStack Query (Server-State) | klein, pragmatisch |
| Lokale Persistenz | AsyncStorage + Query-Cache | Offline-Anzeige der Sammlung |
| Backend | **Supabase** (Postgres, Auth, RLS, Edge Functions) | Auth + DB + serverseitige Freischalt-Validierung ohne eigenen Serverbetrieb |
| Geolocation | `expo-location` (Foreground only) | MVP braucht kein Background-Tracking |

**Architekturprinzip:** Die App ist Client; die **Freischaltung wird serverseitig validiert** (Edge Function `unlock`), nicht im Client entschieden. Der Client sendet Position + Genauigkeit, der Server prüft Distanz gegen die in der DB hinterlegten Koordinaten und schreibt die Freischaltung. Begründung: Clientseitige Prüfung wäre trivial manipulierbar (Abschnitt 10).

---

## 4. Repo-Setup (`wanderlust-app`)

```
wanderlust-app/
├── app/                    # Expo Router Screens (Tabs: Karte, Orte, Sammlung; Stack: Ort-Detail)
├── src/
│   ├── components/         # UI-Bausteine (Badge, OrtCard, BottomSheet, ProgressBar …)
│   ├── badges/             # Portierter SVG-Badge-Renderer (Formen, Töne, Motive)
│   ├── features/unlock/    # Geolocation-Prüfung + Unlock-Flow
│   ├── lib/                # Supabase-Client, Distanzberechnung, Helpers
│   ├── theme/              # Design-Tokens (Farben, Typo, Spacing)
│   └── data/               # Typen + Seed-Referenz
├── supabase/
│   ├── migrations/         # Schema (Abschnitt 7)
│   ├── functions/unlock/   # Edge Function: serverseitige Freischaltung
│   └── seed.sql            # Die 8 Orte
├── assets/                 # Fonts (Cormorant, Hanken Grotesk, Spline Sans Mono), App-Icon, Splash
├── docs/                   # dieses Dokument
└── README.md
```

Ein Repo, kein Monorepo — Backend ist konfiguriertes Supabase, kein eigener Service. CI: Lint + Typecheck + Tests via GitHub Actions, Builds via EAS.

---

## 5. MVP-Funktionsumfang

1. **Ortsliste** — alle Orte mit Badge-Vorschau, Region, Höhe, Status (frei/verschlossen), Filter „offen / freigeschaltet".
2. **Ort-Detail** — großes Badge (verschlossen: vernebelt/entsättigt wie auf der Website), Beschreibung, Höhe, Typ, Koordinaten, Entfernungsanzeige, Freischalt-Button.
3. **Kartenansicht** — alle Orte als Pins; freigeschaltete als Mini-Badge, verschlossene als Nebel-Pin mit Schloss (Fog-of-War-Optik aus `karte.html`); Tap → Bottom Sheet; eigener Standort.
4. **Sammlung** — digitaler Wanderstock/Grid mit allen Badges, Fortschritt „n / 8 erwandert", Freischaltdatum.
5. **Geolocation-Prüfung** — Foreground-Standort, Distanz- und Genauigkeitsprüfung (Abschnitt 9).
6. **Freischaltung** — serverseitig validiert, mit Prägung-Animation (Pop + Ring wie in `map/app.js`).
7. **Persistenz pro Nutzer** — Supabase Auth (anonymer Start, optionales E-Mail-Upgrade), Unlocks in Postgres, offline lesbar aus Cache.

## 6. Nicht-MVP (spätere Ausbaustufen)

- Stocknagel-Shop (echte Messing-Bestellung, Payment)
- Teilen der Sammlung / Social, Freunde-Vergleich
- Regionen-Sets & Sammel-Vervollständigung, neue Orte wöchentlich
- Gemalte Karten-Optik (MapLibre-Custom-Style im Website-Stil statt Standard-Karte)
- Offline-Check-in-Queue (Freischaltung ohne Netz am Gipfel, spätere Synchronisation mit signierter Standort-Historie)
- Routenplanung („Route zu diesem Gipfel planen")
- Tag/Nacht-Tint der Karte, Push-Benachrichtigungen in Ortsnähe
- Mehrsprachigkeit (zunächst nur Deutsch)

---

## 7. Datenmodell (Postgres / Supabase)

```sql
-- Orte (Inhalt aus map/data.js, Koordinaten neu in Dezimalgrad)
create table places (
  id            text primary key,          -- 'zugspitze'
  name          text not null,
  region        text not null,
  type          text not null,             -- 'Höchster Gipfel Deutschlands'
  description   text not null,
  elevation_m   integer not null,
  lat           double precision not null, -- präzise, WGS84
  lng           double precision not null,
  unlock_radius_m integer not null default 250,
  badge_motif   text not null,             -- peak|twin|lake|cliff|forest|tower
  badge_shape   text not null,             -- shield|arch|oval
  badge_tone    text not null,             -- brass|silver|copper|pewter
  active        boolean not null default true
);

-- Nutzer kommen aus Supabase auth.users (anonym oder E-Mail)

-- Freischaltungen
create table unlocks (
  user_id       uuid not null references auth.users(id) on delete cascade,
  place_id      text not null references places(id),
  unlocked_at   timestamptz not null default now(),
  lat           double precision not null, -- Position bei Freischaltung (Audit)
  lng           double precision not null,
  accuracy_m    double precision not null,
  distance_m    double precision not null, -- vom Server berechnet
  primary key (user_id, place_id)
);
```

**RLS:** `places` lesbar für alle; `unlocks` lesbar nur für `user_id = auth.uid()`, **Insert ausschließlich über die Edge Function** (Service Role) — der Client kann keine Unlocks direkt schreiben. Begründung: einziger wirksamer Schutz gegen triviale Manipulation.

**Seed — präzise Koordinaten (vor Release vor Ort/gegen amtliche Daten verifizieren):**

| id | Ort | lat | lng | Radius |
|---|---|---|---|---|
| zugspitze | Zugspitze (Gipfel) | 47.4211 | 10.9863 | 250 m |
| watzmann | Watzmann (Mittelspitze) | 47.5550 | 12.9183 | 300 m |
| koenigssee | Königssee (St. Bartholomä) | 47.5479 | 12.9776 | 400 m |
| brocken | Brocken | 51.7991 | 10.6156 | 300 m |
| feldberg | Feldberg | 47.8740 | 8.0046 | 300 m |
| koenigsstuhl | Königsstuhl | 54.5717 | 13.6628 | 200 m |
| arber | Großer Arber | 49.1125 | 13.1347 | 300 m |
| wendelstein | Wendelstein | 47.7036 | 12.0139 | 250 m |

Alle übrigen Inhalte (Name, Region, Typ, Beschreibung, Höhe, Badge-Konfiguration) 1:1 aus `map/data.js`.

---

## 8. Screens & Navigation

**Tab-Navigation (3 Tabs) + modaler Detail-Stack:**

```
Tabs
├── Karte        (Start-Tab — Kern-Erlebnis, wie karte.html)
├── Orte         (Liste aller Orte, Filter offen/frei)
└── Sammlung     (Wanderstock/Grid, Fortschritt)
Stack/Modal
├── Ort-Detail   (von überall erreichbar; Bottom Sheet auf der Karte, Screen aus der Liste)
├── Unlock-Flow  (Standortprüfung → Ergebnis → Prägung-Animation)
└── Onboarding   (Erststart: Konzept-Erklärung in 3 Schritten + Standort-Permission mit Begründung)
```

**Zentrale Flüsse:**
1. *Entdecken:* Karte öffnen → Pin/Chip antippen → Bottom Sheet mit Badge + Beschreibung → „Route/Details".
2. *Freischalten:* Ort-Detail → „Stocknagel prägen" → Permission (falls nötig) → Standortprüfung mit Statusanzeige → Erfolg: Prägung-Animation, Badge entnebelt sich; Fehler: Distanz + klare Meldung.
3. *Sammeln:* Sammlung → Fortschritt, Tap auf Badge → Detail mit Freischaltdatum.

Design mobile-first nach Website-Vorbild: Paper-Hintergrund, Pine-Flächen für Sammlung, Glass-Chips auf der Karte, Spline-Sans-Mono-Eyebrows, Cormorant-Ortsnamen. `karte.html` ist der verbindliche visuelle Maßstab für den Karten-Tab.

---

## 9. Geolocation-Logik

**Prüfablauf (Client sammelt, Server entscheidet):**
1. Foreground-Permission anfragen (mit Erklärtext, warum). Verweigert → Hinweis-Screen mit Settings-Link; App bleibt ohne Unlock nutzbar.
2. Position mit `Accuracy.High` holen, max. 15 s Timeout; bei `accuracy > 50 m` bis zu 2× nachmessen.
3. Request an Edge Function: `{placeId, lat, lng, accuracy}`.
4. Server: Haversine-Distanz gegen `places.lat/lng`. Freischaltung wenn `distance ≤ unlock_radius_m + min(accuracy, 50)`. Ablehnung wenn `accuracy > 100 m` („Standort zu ungenau").
5. Erfolg → Insert in `unlocks`, Client zeigt Prägung-Animation und invalidiert den Cache.

**Radius:** Standard 250 m, pro Ort überschreibbar (Spalte `unlock_radius_m`) — Königssee/St. Bartholomä braucht mehr (Bootssteg-Bereich), Königsstuhl weniger (Plattform). Begründung: GPS am Gipfel ist gut, in Wäldern/Schluchten schlecht; ein fixer Radius passt nicht für alle Ortstypen.

**Edge Cases & Fehlermeldungen (alle Texte in Marken-Tonalität):**

| Fall | Verhalten |
|---|---|
| Permission verweigert | „Ohne deinen Standort können wir nicht prägen." + Settings-Link |
| GPS-Timeout / kein Fix | „Kein GPS-Empfang — tritt aus dem Schatten der Wand." + Retry |
| Genauigkeit > 100 m | „Standort zu ungenau (±x m). Warte einen Moment im Freien." |
| Zu weit entfernt | „Noch x,x km bis zum Ziel — der Gipfel wartet." (Distanz anzeigen, keine Richtung nötig) |
| Knapp außerhalb (≤ 2× Radius) | gleiche Meldung mit Meterangabe, motivierend |
| Offline am Ort | „Keine Verbindung — Freischaltung braucht Netz." (Offline-Queue ist Ausbaustufe) |
| Bereits freigeschaltet | Button ersetzt durch „Erwandert am …" |
| Mock-Location (Android `isMocked`) | Ablehnung clientseitig + Flag an Server |

---

## 10. Datenschutz & Sicherheit

**Datenschutz (DSGVO):**
- Standort nur **foreground, on demand** — kein Tracking, keine Bewegungsprofile. Begründung: minimiert Datenschutzrisiko und Permission-Hürde.
- Gespeichert wird pro Freischaltung genau ein Standort-Snapshot (Audit/Anti-Cheat); in der Datenschutzerklärung ausweisen. Alternative „gar nicht speichern" abgelehnt, weil sonst Missbrauchsanalyse unmöglich.
- Anonyme Auth als Default (keine personenbezogenen Pflichtdaten); E-Mail nur bei freiwilligem Konto-Upgrade.
- Konto + Daten löschbar (App-Store-Pflicht), Datenexport als Ausbaustufe.
- Permission-Texte (`NSLocationWhenInUseUsageDescription` etc.) erklären den Zweck konkret.

**Manipulation & Missbrauch:**
- **GPS-Spoofing:** vollständig nicht verhinderbar. Maßnahmen im MVP: serverseitige Validierung (Client kann keine Unlocks schreiben), `isMocked`-Check (Android), Plausibilitätsprüfung auf dem Server (z. B. zwei Unlocks in physisch unmöglicher Zeit/Distanz → Flag). Später: Play Integrity / App Attest. Restrisiko bewusst akzeptiert — es geht um Badges, nicht um Geld; sobald der Shop kommt, wird Attestation Pflicht.
- **API-Schutz:** Edge Function nur mit gültigem Auth-Token, Rate Limit (z. B. 10 Unlock-Versuche/h/Nutzer).
- Keine Secrets im Client außer dem öffentlichen Supabase-Anon-Key (durch RLS abgesichert).

---

## 11. Arbeitspakete

| # | Paket | Inhalt | Akzeptanzkriterien | Abhängig von |
|---|---|---|---|---|
| AP1 | Projekt-Setup | Expo + TS + Router + Lint/CI, Fonts gebundelt, Theme-Tokens aus Abschnitt 2.2 | App startet auf iOS & Android; Tabs navigierbar; Farben/Fonts entsprechen Website | — |
| AP2 | Badge-Renderer | Portierung `badges.js` → `react-native-svg`: 3 Formen, 4 Töne, 6 Motive, Locked-Zustand (entsättigt/Nebel) | Alle 8 Orte rendern pixel-treu zum Web (Side-by-side-Review); Locked-Variante vorhanden | AP1 |
| AP3 | Backend & Seed | Supabase-Projekt, Migrationen, RLS, Seed der 8 Orte mit verifizierten Koordinaten, anonyme Auth | Schema deployt; RLS-Tests: Fremd-Unlocks nicht lesbar, Client-Insert in `unlocks` abgelehnt; App erhält Orte via API | AP1 |
| AP4 | Ortsliste & Detail | Liste mit Badge, Status, Filter; Detail-Screen mit Beschreibung, Koordinaten, Entfernung, Status | Beide Screens mit Live-Daten; Locked/Unlocked korrekt; Pull-to-Refresh | AP2, AP3 |
| AP5 | Kartenansicht | `react-native-maps`, Pins (Badge frei / Nebel+Schloss gesperrt), Bottom Sheet, eigener Standort, Ziel-Chips-Rail | Alle Orte korrekt positioniert; Tap → Sheet; Fog-Optik entspricht `karte.html`-Referenz | AP2, AP3 |
| AP6 | Unlock-Flow | Permission-Handling, Standortmessung, Edge Function `unlock`, alle Fehlerfälle aus Abschnitt 9, Prägung-Animation | Innerhalb Radius: Unlock + Animation; außerhalb: Distanzmeldung; alle 8 Edge Cases manuell getestet (Mock-Location-Testplan); Unlock nur serverseitig möglich | AP3, AP4 |
| AP7 | Sammlung | Wanderstock-/Grid-Ansicht, Fortschritt n/8, Freischaltdatum, Offline-Lesbarkeit aus Cache | Frisch freigeschalteter Badge erscheint sofort; im Flugmodus bleibt Sammlung sichtbar | AP2, AP6 |
| AP8 | Onboarding & Settings | 3-Schritte-Intro (aus „So funktioniert's"), Permission-Priming, Konto-Upgrade, Konto-Löschung, Datenschutztext | Erststart-Flow vollständig; Löschung entfernt Auth-User + Unlocks | AP3 |
| AP9 | Härtung & Release | Rate Limit, `isMocked`, Plausibilitäts-Flagging, App-Icons/Splash aus Favicon-SVG, EAS-Builds, Store-Texte | Beta-Build via TestFlight/Internal Track installierbar; Security-Checkliste aus Abschnitt 10 abgehakt | AP6–AP8 |

## 12. Umsetzungsreihenfolge

```
AP1 ──► AP2 ──► AP4 ──► AP6 ──► AP7 ──► AP9
  └───► AP3 ──┘   └───► AP5 ──────┘
                        AP8 (parallel ab AP3)
```

1. **Sprint 1:** AP1 + AP3 (Fundament parallel: App-Gerüst und Backend).
2. **Sprint 2:** AP2 (Badges — Markenkern, früh validieren) + Start AP4.
3. **Sprint 3:** AP4 + AP5 (Inhalte sichtbar, Karte erlebbar).
4. **Sprint 4:** AP6 (Kern-Feature Unlock) + AP7.
5. **Sprint 5:** AP8 + AP9 (Onboarding, Härtung, Beta-Release).

Logik: Das Risiko liegt in Badge-Treue (früh prüfen), Geolocation-Robustheit (braucht reale Feldtests → früh genug fertig) und Server-Validierung (Fundament vor Unlock-Flow).

## 13. Offene Fragen (vor Implementierung klären)

1. **Koordinaten:** Sind die Dezimalkoordinaten in Abschnitt 7 die gewünschten Freischaltpunkte (Gipfelkreuz vs. Bergstation vs. Aussichtsplattform)? Beispiel Königssee: Steg St. Bartholomä oder Seelände Schönau?
2. **Auth-Strategie:** Anonymer Start mit optionalem E-Mail-Upgrade ok — oder ist ein Pflicht-Login gewünscht (z. B. wegen späterem Shop)?
3. **Karten-Optik:** Reicht im MVP eine Standard-Karte im Paper-Farbstil, oder ist die gemalte Karten-Ästhetik aus `karte.html` MVP-Pflicht (≈ +1–2 Wochen für MapLibre-Custom-Style)?
4. **Account-los testen:** Sollen Freischaltungen ohne jegliches Konto rein lokal möglich sein (Konfliktrisiko bei späterem Sync)? Empfehlung: nein, anonyme Auth deckt das ab.
5. **Budget/Keys:** Google-Maps-API-Key für Android (Kosten) vorhanden/gewünscht, oder Apple Maps + osmdroid-Alternative?
6. **Shop-Teaser:** Soll der „Als Stocknagel bestellen"-Button im MVP sichtbar (deaktiviert/„bald") sein oder ganz entfallen?
7. **Mindest-OS:** Vorschlag iOS 16+ / Android 8+ — ok?
8. **Rechtliches:** Wer liefert Datenschutzerklärung und Impressum für die Stores?
