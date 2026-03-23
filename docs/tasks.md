# Tasks – Wiener Nebel

## Ziel

Diese Datei beschreibt die nächsten Arbeitspakete für das MVP auf Basis der neuen Zielarchitektur mit Web/PWA, Mobile, Edge-API und gemeinsamen Kernpaketen.

## Phase 1 – Monorepo und Basis

- pnpm Workspace einrichten
- `turbo.json` konfigurieren
- TypeScript-Basis für alle Apps und Pakete anlegen
- gemeinsame Namenskonventionen für Apps, Pakete und Imports festlegen

## Phase 2 – Kernpakete

### Domain

- Match-State modellieren
- View-Projektionen für `public`, `player` und `internal` anlegen
- Rule-Engine-Grundstruktur erstellen

### Contracts

- Zod-Schemas für Requests und Responses definieren
- DTOs für Lobby, Match und Voting strukturieren
- Validierung an den API-Grenzen festlegen

### Map Data

- `vienna_core` als versionierte Startkarte ablegen
- Graphmodell für Nodes und Edges definieren
- Karten-Registry aufbauen

### UI Tokens

- Farben, Typografie, Spacing und Motion definieren
- Tokens für Web und Mobile nutzbar machen

### Map Tools

- Prüfwerkzeuge für Graphdaten anlegen
- spätere Generatoren und Importer vorbereiten

## Phase 3 – Edge-Backend

### Worker

- Routing für HTTP-API anlegen
- Health-Endpoint und API-Versionierung vorsehen
- Requests über `packages/contracts` validieren

### Durable Object

- `GameRoom`-Klasse für Lobby und Match-State anlegen
- atomare Rundenauflösung im Durable Object vorsehen
- Snapshots für spätere Persistenz und Reconnect vorbereiten

### D1

- Lobby-Index
- Match-Metadaten
- spätere Match-Summaries oder Replays

### Endpunkte

- `POST /guest/login`
- `POST /lobbies`
- `POST /lobbies/join`
- `POST /lobbies/start`
- `GET /matches/:id/state`
- `POST /matches/:id/move`
- `POST /matches/:id/ready`
- `POST /matches/:id/meeting`
- `POST /matches/:id/vote`

## Phase 4 – Clients

### Web/PWA

- App-Shell und Installierbarkeit
- Home Screen
- Lobby Screen
- Match Screen
- Voting Screen
- Offline-freundliche Assets und Reconnect-Verhalten

### Mobile

- Expo-App mit demselben Informationsmodell
- Basisnavigation
- Home Screen
- Lobby Screen
- Match Screen
- Voting Screen

## Phase 5 – Spiellogik

- Move Validation
- Ticket Handling
- Round Resolution
- Reveal System
- Win Conditions
- Meeting Trigger
- Vote Handling
- Result Evaluation

## Phase 6 – Synchronisation und Stabilität

- Polling oder SSE für Live-Updates im MVP festlegen
- Reconnect sauber behandeln
- idempotente Client-Aktionen sicherstellen
- Fehlerszenarien und Timeouts definieren

## Phase 7 – Testing

- Unit Tests für Domain und View-Projektionen
- Contract-Tests für API-Schemas
- Integrationstests für Match-Flow
- Smoke-Test für Web/PWA und Edge-API

## Phase 8 – Polish

- visuelle Qualität der Clients erhöhen
- Performance auf schwächeren Geräten prüfen
- Logs, Monitoring und Fehlerrückgaben verbessern
- Deployment-Checkliste für Cloudflare Pages und Workers erstellen

## Definition of Done

- Spiel ist mit 3 bis 6 Spielern spielbar
- Hidden Role funktioniert ohne Informationsleck
- Moves werden korrekt validiert
- Voting funktioniert
- Siegbedingungen greifen korrekt
- Web/PWA ist intern leicht testbar und installierbar
- Mobile App nutzt dieselbe Domäne und dieselben Contracts
