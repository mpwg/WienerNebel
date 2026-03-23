# Tasks – Wiener Nebel

## Ziel

Diese Datei beschreibt konkrete Arbeitspakete für Codex, um das MVP umzusetzen.

---

## Phase 1 – Setup

- Monorepo Struktur erstellen
- pnpm Workspace einrichten
- turbo.json konfigurieren
- TypeScript Setup für alle Packages

---

## Phase 2 – Shared Package

- Types definieren (Player, Match, Move, Events)
- Zod Schemas erstellen
- Rule Engine Grundstruktur

---

## Phase 3 – Backend

### Worker
- Routing
- JSON API

### Durable Object
- GameRoom Klasse
- Match State
- Rollenzuweisung

### Endpoints
- POST /guest/login
- POST /lobbies
- POST /lobbies/join
- POST /lobbies/start
- GET /matches/state
- POST /matches/move
- POST /matches/ready

---

## Phase 4 – Game Logic

- Move Validation
- Ticket Handling
- Round Resolution
- Reveal System
- Win Conditions

---

## Phase 5 – Voting

- Meeting Trigger
- Vote Handling
- Result Evaluation

---

## Phase 6 – Mobile App

- Navigation Setup
- Home Screen
- Lobby Screen
- Match Screen
- Move Picker
- Voting Screen

---

## Phase 7 – Testing

- Unit Tests für Rule Engine
- Integration Tests für Match Flow

---

## Phase 8 – Polish

- Error Handling
- Reconnect
- Performance Optimierung

---

## Definition of Done

- Spiel ist spielbar mit 3–5 Spielern
- Hidden Role funktioniert
- Moves werden korrekt validiert
- Voting funktioniert
- Siegbedingungen greifen korrekt
