# Wiener Nebel

## Kurzbeschreibung

**Wiener Nebel** ist ein Multiplayer-Spiel mit Hidden-Role-, Verfolgungs- und Social-Deduction-Mechaniken.

Die Spielidee kombiniert:
- ein abstrahiertes Wiener Öffi-Netz als Spielfeld
- rundenbasierte Bewegung
- einen geheimen Mr. X
- Diskussion, Verdacht und Abstimmung

Der MVP ist für **3 bis 6 Spieler** gedacht und soll zuerst als **Web/PWA für den Couch Mode** funktionieren. Die mobile App nutzt dieselbe Spiellogik und dieselben Server-Schnittstellen.

## Kernfantasie

Ein Spieler ist heimlich **Mr. X**.
Niemand weiß zu Beginn, wer es ist.
Alle Spieler bewegen sich scheinbar normal durch Wien.
Über Logs, Reveal-Momente und Diskussionen versuchen die Ermittler, Mr. X zu identifizieren und zu fangen.

Mr. X versucht gleichzeitig:
- unauffällig zu bleiben
- Spuren zu verwischen
- falsche Verdachtsmomente zu erzeugen
- bis zum Ende zu entkommen

## MVP-Ziele

Der MVP soll Folgendes erlauben:
- Gast-Login
- Lobby mit Join-Code
- Match-Start mit 3 bis 6 Spielern
- zufällige Rollenzuweisung
- geheimer Mr. X
- rundenbasierte Züge
- Ticket-System
- öffentliche Logs
- Meeting- und Voting-Basisfunktion
- Match-Ende mit Reveal

## Plattformen

### Web/PWA

- React mit TypeScript
- Vite als Build-Tool
- PWA für leichtes Hosting und schnelle interne Tests

### Mobile

- Expo auf Basis von React Native und TypeScript
- iOS und Android
- gleiche API und gleiche Domäne wie die Web/PWA

### Backend

- Cloudflare Workers
- Durable Objects
- D1

### Hosting-Ziel

- Cloudflare Pages für die Web/PWA
- Cloudflare Workers und Durable Objects für Match-State und API
- D1 für Metadaten, Snapshots und spätere Replays
- einfacher Betrieb mit möglichst wenig Infrastruktur für das MVP

## Architekturleitplanken

### Autoritative Spiellogik

- der Server ist immer die Quelle der Wahrheit
- jeder Raum oder jedes Match hat genau einen autoritativen Match-State
- Runden werden atomar im Durable Object aufgelöst

### Klare Paketgrenzen

- `packages/domain` enthält nur Spiellogik und Projektionen
- `packages/contracts` enthält Request- und Response-Schemas
- `packages/map-data` enthält versionierte Karten und Graphdaten
- `packages/ui-tokens` enthält das gemeinsame visuelle Fundament
- `packages/map-tools` erzeugt und prüft Kartendaten außerhalb der Laufzeit

### Schutz versteckter Informationen

- öffentliche Views und spielerspezifische Views werden getrennt erzeugt
- geheime Daten von Mr. X dürfen nie nur im Client versteckt werden
- private Informationen verlassen den Server nur über explizite Projektionen

## Spielablauf

### Setup

1. Host erstellt Lobby.
2. Spieler treten über Join-Code bei.
3. Karte und Regelset werden festgelegt.
4. Spiel startet.
5. Server weist genau einem Spieler die Rolle `mr_x` zu.

### Runde

1. Jeder Spieler sieht seinen erlaubten State.
2. Jeder wählt geheim einen legalen Zug.
3. Jeder bestätigt mit `ready`.
4. Der Server löst die Runde atomar auf.
5. Öffentliche Logs und Reveal-Effekte werden erzeugt.
6. Siegbedingungen werden geprüft.
7. Nächste Runde startet.

## Rollen

### Mr. X

- genau ein Spieler pro Match
- ist anfangs nicht bekannt
- hat Zugriff auf Black Tickets
- versucht, unentdeckt zu bleiben und nicht gefangen zu werden

### Ermittler

- alle anderen Spieler
- kennen die Identität von Mr. X nicht
- nutzen Logs, Diskussionen und Kartenwissen
- gewinnen durch Enttarnung und oder Fang

## Siegbedingungen

### Ermittler gewinnen, wenn

- Mr. X auf demselben Node wie ein Ermittler endet
- Mr. X keine legalen Züge mehr hat
- Mr. X korrekt identifiziert und nach Regelset festgesetzt wird

### Mr. X gewinnt, wenn

- die maximale Rundenzahl erreicht wird
- keine Fangbedingung erfüllt wurde

### MVP-Vorschlag

- 20 Runden pro Match
- Fang auf gleichem Node zählt sofort als Sieg der Ermittler

## Karte und Bewegung

Das Gameplay basiert nicht auf kompletter freier Navigation, sondern auf einem vorberechneten Graphen.

### Node-Typen

- `stop`
- `hub`
- `district_entry`

### Edge-Typen

- `walk`
- `subway`
- `tram`
- `bus`

### Startkarte

- `vienna_core`
- zentrale Bezirke und wichtige Öffi-Hubs

## Ticketsystem

### Ticketarten

- `walk`
- `subway`
- `tram`
- `bus`
- `black`

### Zweck

- jede Bewegung kostet das passende Ticket
- Mr. X kann mit Black Tickets sein Transportmittel verschleiern

## Informationsdesign

Das Spiel lebt von asymmetrischer Information.

### Öffentlich sichtbar

- Rundenstatus
- eigene Position
- definierte öffentliche Logeinträge
- Voting-Ergebnisse
- Reveal-Hinweise

### Nur serverseitig oder privat

- Rolle von Mr. X
- echte versteckte Position von Mr. X
- interne Round-Resolution-Daten

## Meetings und Voting

Spieler können in bestimmten Situationen ein Meeting starten.

### Ablauf

1. Meeting wird ausgelöst.
2. Diskussionstimer läuft.
3. Spieler stimmen ab.
4. Server löst das Ergebnis auf.

### MVP-Regel

- Fehlvotum eliminiert niemanden
- das Ergebnis erzeugt Information, aber das Spiel läuft weiter

## Nicht-Ziele des MVP

Diese Punkte sind bewusst nicht im ersten Schritt enthalten:
- GPS oder Real-World-Mode
- Push Notifications
- Matchmaking mit Fremden
- Voice Chat
- mehrere Städte
- aufwendige Skills oder Items

## Langfristige Erweiterungen

- GPS-City-Mode in Wien
- mehrere Karten und Städte
- Replay-System
- Live-Updates mit SSE oder WebSockets
- Spezialfähigkeiten
- Hybrid-Brettspiel-Modus
