# Wiener Nebel

Wiener Nebel ist ein mobiles Multiplayer-Spiel mit Hidden-Role- und Deduction-Mechaniken auf Basis eines abstrahierten Wiener Öffi-Netzes.

## 🧠 Kernidee
- 3–6 Spieler
- 1 geheimer Mr. X (Impostor)
- rundenbasiertes Gameplay
- Wien-Karte mit Öffis (U-Bahn, Tram, Bus)
- Social Deduction + Verfolgung

👉 Einer lügt. Alle suchen.

---

## 🎮 Gameplay
Alle Spieler bewegen sich auf einer abstrahierten Wien-Karte.

- Jeder wählt pro Runde einen Zug
- Bewegungen werden teilweise verschleiert
- Spieler diskutieren und verdächtigen sich gegenseitig
- Abstimmungen (Meetings) können ausgelöst werden

Ziel:
- **Ermittler**: Mr. X enttarnen und fangen  
- **Mr. X**: unentdeckt bleiben und überleben

---

## 🏗️ Tech Stack

### Mobile
- React Native + TypeScript

### Backend
- Cloudflare Workers
- Durable Objects (Game State pro Match)
- D1 (Persistenz)

### Shared Code
- TypeScript Packages (Typen, Regeln, Schemas)

---

## 📦 Monorepo Struktur

- `apps/mobile` – Mobile App (iOS & Android)
- `apps/worker` – Backend (Cloudflare)
- `packages/shared` – Typen, Game Rules, Schemas
- `packages/map-tools` – Karten- und Graph-Generierung
- `docs/` – Konzept, Architektur, Tasks

---

## 🎯 MVP Ziel

Ein spielbares Grundsystem mit:

- Gast-Login
- Lobby mit Join-Code
- Match-Start
- zufällige Hidden-Rolle (Mr. X)
- Zugauswahl (Öffis + Fuß)
- Rundenauflösung
- Public Logs (verschleierte Infos)
- Voting / Meetings
- Siegbedingungen

---

## 🚀 Vision

Wiener Nebel verbindet:
- klassische Brettspiel-Mechaniken
- moderne Mobile-Games
- Social Deduction
- reale Stadtstrukturen

Langfristig:
- GPS City Mode (real durch Wien spielen)
- mehrere Städte
- Hybrid Brettspiel + App

---

## 📍 Status

🚧 Projekt im Aufbau (MVP Phase)
