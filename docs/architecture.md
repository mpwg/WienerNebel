# Architektur – Wiener Nebel

## Ziele

Die Zielarchitektur soll drei Dinge gleichzeitig erreichen:

- hohe Wartbarkeit durch saubere Paketgrenzen
- einfacher Hosting-Pfad für das MVP
- graphisch starke Clients ohne doppelte Spiellogik

## Architekturübersicht

```text
Web/PWA (React + Vite)         Mobile (Expo)
          |                         |
          +----------- HTTP --------+
                        |
                 Edge API Worker
                        |
                Durable Object
                GameRoom pro Match
                        |
                       D1
```

## Verantwortung pro Schicht

### `apps/web`

- primärer Client für schnelle Playtests
- installierbar als PWA
- nutzt dieselben Contracts wie Mobile

### `apps/mobile`

- nativer Client für iOS und Android
- gleiche API, gleiche Domäne, eigenes UI

### `apps/edge-api`

- dünne API-Schicht
- validiert Eingaben
- delegiert Match-Aktionen an Durable Objects

### `packages/domain`

- reine Spiellogik
- Match-State
- Rule Engine
- View-Projektionen für unterschiedliche Sichtbarkeiten

### `packages/contracts`

- Zod-Schemas
- API-DTOs
- Event- und Payload-Typen

### `packages/map-data`

- versionierte Karten
- Graphdaten für das Spiel

### `packages/ui-tokens`

- gemeinsames visuelles Fundament
- Farben, Typografie, Spacing, Motion

### `packages/map-tools`

- Build- und Prüfwerkzeuge für Karten
- nicht im Hot Path des Spiels

## Zentrale Architekturregeln

### 1. Domäne bleibt frameworkfrei

Die Spiellogik kennt keine Cloudflare-APIs, keine React-Komponenten und keine Datenbankzugriffe.

### 2. Hidden Information wird serverseitig getrennt

Es gibt eigene Projektionen für öffentliche, spielerspezifische und interne Daten. Geheime Informationen werden nie nur im Client ausgeblendet.

### 3. Durable Objects halten den Hot Path

Die eigentliche Rundenauflösung läuft im Durable Object. D1 speichert Metadaten, Snapshots und spätere Historie.

### 4. Web zuerst, Mobile direkt mitgedacht

Die Web/PWA senkt die Hürde für Tests und Hosting. Mobile nutzt dieselbe Domäne und dieselben Contracts, damit keine Spiellogik doppelt entsteht.

## Hosting-Strategie

### MVP

- Cloudflare Pages für `apps/web`
- Cloudflare Workers für `apps/edge-api`
- Durable Objects für Match-State
- D1 für Persistenz außerhalb des Hot Path

### Vorteil

- wenig Betriebsaufwand
- keine eigene Server-Flotte
- einfacher Pfad von internem Test zu öffentlichem Test

## Empfohlene nächste Schritte

1. Kernpakete mit klaren Grenzen zuerst stabilisieren.
2. Danach Edge-API und `GameRoom` verdrahten.
3. Web/PWA als ersten echten Client ausbauen.
4. Mobile auf dieselben Contracts und dieselbe Domäne setzen.
