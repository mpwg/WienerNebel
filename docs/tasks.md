# Tasks – Wiener Nebel

## Ziel

Diese Datei beschreibt die nächsten Arbeitspakete für das MVP auf Basis der neuen Zielarchitektur mit Web/PWA, Mobile, Edge-API und gemeinsamen Kernpaketen.

## Aktueller Stand

Stand: 23.03.2026

### Bereits erledigt

- Phase 1 ist im Wesentlichen abgeschlossen.
- Monorepo mit `pnpm`-Workspace ist eingerichtet.
- `turbo.json` und gemeinsame TypeScript-Basis sind angelegt.
- Grundgerüst für `apps/web`, `apps/mobile` und `apps/edge-api` existiert.
- Grundgerüst für `packages/domain`, `packages/contracts`, `packages/map-data`, `packages/ui-tokens` und `packages/map-tools` existiert.
- CI baut und prüft Apps und Pakete auf GitHub.
- `pnpm audit` ist in der CI integriert.
- Dependabot ist für npm-Dependencies und GitHub Actions eingerichtet.
- Aktuell sind keine bekannten Schwachstellen im Dependency-Stand vorhanden.

### Aktuell offen

- Die meisten fachlichen Arbeitspakete ab Phase 2 sind noch nicht umgesetzt.
- `packages/domain` deckt jetzt Lobby, Match-Start, Move-Planung, Ready/Resolution sowie einfache Meeting- und Voting-Übergänge ab, benötigt aber noch tiefere Spielregeln und Legality Checks.
- `packages/contracts` enthält jetzt Request-/Response-Schemas für Lobby-Erstellung, Lobby-Join, Match-State sowie die ersten Match-Aktionen.
- Die `edge-api` validiert und bedient jetzt die ersten Lobby- und Match-Aktionsflüsse über `packages/contracts`, es fehlen aber noch robustere Regeln, Fehlerfälle und Persistenz jenseits des MVP-Grundpfads.
- `apps/web` bietet jetzt einen ersten lokalen Browser-Testpfad für Lobby, Join, Match-State und Match-Aktionen gegen die lokale Edge-API.
- Die Clients sind weiterhin noch kein vollständiger Spiel-UX-Flow, aber die Web-App ist jetzt als technische Testoberfläche nutzbar.

## Phase 1 – Monorepo und Basis

- [x] pnpm Workspace einrichten
- [x] `turbo.json` konfigurieren
- [x] TypeScript-Basis für alle Apps und Pakete anlegen
- [x] gemeinsame Namenskonventionen für Apps, Pakete und Imports festlegen

## Phase 2 – Kernpakete

### Domain

- [x] Match-State modellieren
- [x] View-Projektionen für `public`, `player` und `internal` anlegen
- [x] Rule-Engine-Grundstruktur erstellen

### Contracts

- [x] Zod-Schemas für Requests und Responses definieren
- [x] DTOs für Lobby, Match und Voting strukturieren
- [x] Validierung an den API-Grenzen festlegen

### Map Data

- [ ] `vienna_core` als versionierte Startkarte ablegen
- [ ] Graphmodell für Nodes und Edges definieren
- [ ] Karten-Registry aufbauen

### UI Tokens

- [ ] Farben, Typografie, Spacing und Motion definieren
- [ ] Tokens für Web und Mobile nutzbar machen

### Map Tools

- [ ] Prüfwerkzeuge für Graphdaten anlegen
- [ ] spätere Generatoren und Importer vorbereiten

## Phase 3 – Edge-Backend

### Worker

- [x] Routing für HTTP-API anlegen
- [x] Health-Endpoint und API-Versionierung vorsehen
- [x] Requests über `packages/contracts` validieren

### Durable Object

- [x] `GameRoom`-Klasse für Lobby und Match-State anlegen
- [x] atomare Rundenauflösung im Durable Object vorsehen
- [ ] Snapshots für spätere Persistenz und Reconnect vorbereiten

### D1

- [ ] Lobby-Index
- [ ] Match-Metadaten
- [ ] spätere Match-Summaries oder Replays

### Endpunkte

- [ ] `POST /guest/login`
- [x] `POST /lobbies`
- [x] `POST /lobbies/join`
- [x] `POST /lobbies/start`
- [x] `GET /matches/:id/state`
- [x] `POST /matches/:id/move`
- [x] `POST /matches/:id/ready`
- [x] `POST /matches/:id/meeting`
- [x] `POST /matches/:id/vote`

## Phase 4 – Clients

### Web/PWA

- [x] App-Shell und Installierbarkeit
- [x] Home Screen
- [x] Lobby Screen
- [x] Match Screen
- [ ] Voting Screen
- [ ] Offline-freundliche Assets und Reconnect-Verhalten

### Mobile

- [ ] Expo-App mit demselben Informationsmodell
- [ ] Basisnavigation
- [ ] Home Screen
- [ ] Lobby Screen
- [ ] Match Screen
- [ ] Voting Screen

## Phase 5 – Spiellogik

- [ ] Move Validation
- [ ] Ticket Handling
- [x] Round Resolution
- [ ] Reveal System
- [ ] Win Conditions
- [x] Meeting Trigger
- [x] Vote Handling
- [ ] Result Evaluation

## Phase 6 – Synchronisation und Stabilität

- [ ] Polling oder SSE für Live-Updates im MVP festlegen
- [ ] Reconnect sauber behandeln
- [ ] idempotente Client-Aktionen sicherstellen
- [ ] Fehlerszenarien und Timeouts definieren

## Phase 7 – Testing

- [ ] Unit Tests für Domain und View-Projektionen
- [ ] Contract-Tests für API-Schemas
- [ ] Integrationstests für Match-Flow
- [ ] Smoke-Test für Web/PWA und Edge-API

## Phase 8 – Polish

- [ ] visuelle Qualität der Clients erhöhen
- [ ] Performance auf schwächeren Geräten prüfen
- [ ] Logs, Monitoring und Fehlerrückgaben verbessern
- [ ] Deployment-Checkliste für Cloudflare Pages und Workers erstellen

## Definition of Done

- Spiel ist mit 3 bis 6 Spielern spielbar
- Hidden Role funktioniert ohne Informationsleck
- Moves werden korrekt validiert
- Voting funktioniert
- Siegbedingungen greifen korrekt
- Web/PWA ist intern leicht testbar und installierbar
- Mobile App nutzt dieselbe Domäne und dieselben Contracts
