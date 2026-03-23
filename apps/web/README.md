# Web-Testumgebung

## Zweck

`apps/web` ist die lokale Browser-Testoberfläche für Wiener Nebel. Die App spricht gegen die lokale Edge-API und erlaubt schnelle manuelle Tests der aktuellen Match-Flows.

## Start

Aus dem Repository-Root:

```bash
corepack pnpm dev:test:web
```

Oder direkt im Paket:

```bash
corepack pnpm --filter @wiener-nebel/web dev
```

Die Web-App läuft danach standardmäßig unter [http://localhost:5173](http://localhost:5173).

## Voraussetzung

Für echte API-Tests muss zusätzlich die lokale Edge-API laufen:

```bash
corepack pnpm dev:test:edge
```

Standardmäßig erwartet die Web-App die API unter `http://127.0.0.1:8787`. Die Basis-URL kann in der Oberfläche angepasst werden.

## Aktueller Testumfang

- Lobby erstellen
- Lobby beitreten
- Match starten
- öffentlichen Match-State laden
- private Spielersicht laden
- Move senden
- Ready senden
- Meeting starten
- Vote senden

## Typischer Ablauf

1. `corepack pnpm dev:test:edge` starten
2. `corepack pnpm dev:test:web` starten
3. Browser auf [http://localhost:5173](http://localhost:5173) öffnen
4. Lobby erstellen
5. `matchId` und `joinCode` notieren
6. in einem zweiten Browser-Tab oder Fenster mit denselben Daten beitreten
7. Match starten und Aktionen durchklicken

## Nützliche Hinweise

- Die Web-App speichert die lokale Sitzung im Browser.
- Mit `Sitzung löschen` in der Oberfläche kannst du den lokalen Zustand zurücksetzen.
- Für zwei lokale Spieler sind zwei Browser-Kontexte sinnvoll, zum Beispiel normales Fenster plus Inkognito-Fenster.
