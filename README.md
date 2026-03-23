# Wiener Nebel

Wiener Nebel ist ein Multiplayer-Spiel mit Hidden-Role-, Verfolgungs- und Social-Deduction-Mechaniken auf Basis eines abstrahierten Wiener Öffi-Netzes.

## Produktidee

- 3 bis 6 Spieler
- 1 geheimer Mr. X
- rundenbasiertes Gameplay
- Wien-Karte mit Öffis und Fußwegen
- Diskussion, Täuschung und Verfolgung

Einer lügt. Alle suchen.

## Architekturziele

- gut wartbare Domänenlogik mit klaren Grenzen
- einfach hostbare Web/PWA für schnelle Playtests
- mobile App für iOS und Android ohne separate Spiellogik
- autoritativer Match-State auf dem Server
- graphisch ansprechende Clients mit gemeinsamen Design-Tokens

## Zielarchitektur

### Clients

- `apps/web` – React-Webclient als PWA für Browser, Couch-Mode und leichtes Hosting
- `apps/mobile` – Expo-App für iOS und Android

### Backend

- `apps/edge-api` – Cloudflare Worker als API-Einstiegspunkt
- Durable Objects – autoritativer Match-State pro Lobby oder Match
- D1 – Metadaten, Snapshots, Replays und Lobby-Index

### Gemeinsame Pakete

- `packages/domain` – reine Spiellogik und View-Projektionen
- `packages/contracts` – API-Schemas und DTOs
- `packages/map-data` – versionierte Kartendaten
- `packages/ui-tokens` – Farben, Typografie, Spacing und Motion
- `packages/map-tools` – Generatoren und Prüfwerkzeuge für Karten

## Monorepo-Struktur

```text
apps/
  mobile/
  web/
  edge-api/
packages/
  domain/
  contracts/
  map-data/
  ui-tokens/
  map-tools/
docs/
  concept.md
  architecture.md
  tasks.md
```

## Entwicklungsfokus

Der MVP soll zuerst auf schnelles Testen und einfache Auslieferung optimiert werden:

- Web/PWA zuerst für sofortige interne Tests
- Expo-App als mobiler Client auf derselben API und Domäne
- Cloudflare als einfacher Hosting-Pfad für PWA und Backend

## Schnellstart

```bash
pnpm install
pnpm dev:web
pnpm dev:edge
pnpm dev:mobile
```

## Weiterführende Dokumente

- [Konzept](docs/concept.md)
- [Architektur](docs/architecture.md)
- [Tasks](docs/tasks.md)

## Status

Projekt im Aufbau. Das Repository enthält jetzt das Monorepo-Grundgerüst für Web/PWA, Mobile, Edge-API und gemeinsame Pakete.
