Hier ist eine detaillierte Markdown-Spezifikation, die du direkt als Grundlage für Codex verwenden kannst.

# Scotland Yard Wien – Hidden Mr. X
## Produkt- und Umsetzungsspezifikation für Codex

## 1. Ziel

Baue ein mobiles Multiplayer-Spiel für iPhone und Android mit dem Arbeitstitel **Scotland Yard Wien – Hidden Mr. X**.

Das Spiel kombiniert:
- das Bewegungs- und Verfolgungsprinzip von *Scotland Yard*
- mit Hidden-Role- und Social-Deduction-Elementen wie bei *Among Us*

### Kern-Twist
Zu Beginn weiß **niemand**, wer **Mr. X** ist.  
Alle Spieler erscheinen zunächst als normale Ermittler.  
Ein Spieler ist jedoch heimlich Mr. X und versucht:
- unauffällig zu agieren
- Verdacht zu vermeiden
- sich taktisch durch Wien zu bewegen
- bis zum Endspiel nicht enttarnt oder gefasst zu werden

Die anderen Spieler müssen:
- Bewegungsmuster lesen
- Logs interpretieren
- diskutieren
- abstimmen
- Mr. X entlarven und am Ende fangen

---

## 2. Plattformen

### Clients
- Mobile Apps
- primär iOS und Android
- mobile-first UX
- kein Desktop als Primärziel

### Backend
- Cloudflare Workers
- Durable Objects
- D1
- optional R2 in späterer Phase

### Hosting-Ziel
Das MVP soll auf dem **Cloudflare Free Plan** lauffähig sein.  
Aktuell sind auf dem Free Plan u. a. **100.000 Worker-Requests pro Tag** verfügbar. SQLite-basierte **Durable Objects** sind auf Free verfügbar. **D1** ist ebenfalls im Free Plan nutzbar, mit aktuell **bis zu 10 Datenbanken pro Account** und **500 MB pro Datenbank**.  [oai_citation:0‡Cloudflare Docs](https://developers.cloudflare.com/workers/platform/limits/?utm_source=chatgpt.com)

---

## 3. Externe Datenquellen

### Kartenbasis
- OpenStreetMap als visuelle Kartengrundlage
- keine freie Navigation im MVP
- stattdessen ein vorberechneter Spielgraph

### Wien-spezifische Verkehrsdaten
Die Wiener Linien stellen offene Daten bereit, darunter:
- Routing
- Echtzeit-Abfahrtsdaten
- Geodaten von Haltestellen und Aufzügen
- modifizierte Haltestellenlisten mit GPS-Koordinaten  [oai_citation:1‡wienerlinien.at](https://www.wienerlinien.at/open-data?utm_source=chatgpt.com)

### MVP-Ansatz
Im MVP werden **keine Live-Routing-Abfragen** an Wiener-Linien-Dienste pro Zug gemacht.  
Stattdessen wird offline ein kompakter Spielgraph erzeugt:
- Nodes = Haltestellen + ausgewählte Umsteigepunkte
- Edges = Fuß, U-Bahn, Tram, Bus
- die App lädt nur diesen Graphen

---

## 4. Spielvision

## 4.1 High Concept

Ein rundenbasiertes Multiplayer-Spiel auf einer Wien-Karte.

Jeder Spieler kann sich entlang eines abstrahierten Verkehrsgraphen bewegen:
- zu Fuß
- mit U-Bahn
- mit Straßenbahn
- mit Bus

Ein Spieler ist heimlich Mr. X.
Niemand kennt seine Identität.
Das Spiel verläuft in drei Ebenen gleichzeitig:

1. **Taktische Bewegung**
2. **Informationsmanagement**
3. **Soziale Deduktion**

---

## 4.2 Primäre Zielgruppe

- Freunde
- Familien
- kleine Gruppen
- Spielrunden zuhause
- später auch reale City-Games in Wien

---

## 4.3 MVP-Spielmodus

### Modus: Couch Mode
- alle spielen virtuell auf der Wien-Karte
- kein GPS nötig
- 3 bis 6 Spieler
- 1 versteckter Mr. X
- 2 bis 5 normale Spieler

Der City Mode mit GPS ist **nicht Teil des MVP**.

---

## 5. Kernspielregeln

## 5.1 Spieleranzahl
- Minimum: 3
- Maximum: 6
- Empfohlen für MVP: 4 bis 5

## 5.2 Rollen
- genau 1 Spieler ist **Mr. X**
- alle anderen sind **Ermittler**
- die Rolle ist nur serverseitig bekannt
- jeder Client erhält nur die Informationen, die er sehen darf

## 5.3 Siegbedingungen

### Sieg für Ermittler
Die Ermittler gewinnen, wenn:
- Mr. X per Abstimmung korrekt enttarnt und anschließend festgesetzt wird
- oder Mr. X sich am Ende einer Runde auf demselben Node wie ein Ermittler befindet
- oder Mr. X keine legalen Züge mehr hat

### Sieg für Mr. X
Mr. X gewinnt, wenn:
- eine definierte Anzahl Runden überlebt wurde
- oder alle Ermittler spielmechanisch handlungsunfähig sind
- oder eine finale Escape-Bedingung erfüllt wurde

### MVP-Empfehlung
- 20 Runden
- Mr. X gewinnt, wenn er Runde 20 überlebt
- Ermittler gewinnen durch Fang oder erfolgreiche Enttarnung plus Festsetzung

---

## 5.4 Spielphasen

### Phase A – Hidden Phase
- alle Rollen verborgen
- alle bewegen sich normal
- keine direkte Identität von Mr. X sichtbar
- Logs liefern nur partielle Informationen

### Phase B – Suspicion Phase
- Hinweise häufen sich
- Diskussion und Abstimmungen werden zentral
- Mr. X versucht, unauffällig zu bleiben

### Phase C – Hunt Phase
- spätere Reveal-Regeln oder starke Indizien
- aus Deduktion wird konkrete Jagd
- klassischer Scotland-Yard-Charakter tritt stärker hervor

---

## 6. Rundenlogik

## 6.1 Grundprinzip
Das Spiel ist **rundenbasiert**, nicht echtzeitgetrieben.

Jede Runde besteht aus:

1. State an alle Clients senden
2. Spieler wählen ihren Zug
3. Spieler markieren sich als ready
4. Server validiert alle Züge
5. Runde wird atomar aufgelöst
6. Events/Logs werden erzeugt
7. Siegbedingungen werden geprüft
8. nächste Runde beginnt

---

## 6.2 Zugreihenfolge
Für das MVP werden alle Züge als **simultan geplant** und dann serverseitig aufgelöst.

### Vorteil
- fairer
- einfacher für Multiplayer
- reduziert Metagaming durch Reihenfolge
- technisch sauber in einem Durable Object abbildbar

---

## 6.3 Reveal-Mechanik
Mr. X ist nicht von Anfang an bekannt.  
Zusätzlich gibt es Reveal-Mechaniken auf Basis der Runde.

### Beispielkonfiguration
- Runde 4: Region Reveal
- Runde 8: Transport Reveal Upgrade
- Runde 12: Bezirks-Reveal
- Runde 16: exakter Node Reveal
- Runde 20: Finale

Das Reveal betrifft **nicht automatisch die Identität**, sondern zunächst nur seine Spur.

---

## 7. Spielgraph

## 7.1 Modell
Die Karte ist kein frei begehbares Straßennetz für das Gameplay, sondern ein abstrahierter Graph.

### Node-Typen
- `stop` – Haltestelle
- `hub` – wichtiger Umstiegspunkt
- `district_entry` – Zonen-/Bezirksknoten
- `special` – Sonderknoten für spätere Spielvarianten

### Edge-Typen
- `walk`
- `subway`
- `tram`
- `bus`

---

## 7.2 Bewegungsregeln
Ein Spieler steht immer auf genau einem Node.

Pro Runde darf ein Spieler:
- genau einen regulären Zug machen
- von seinem aktuellen Node entlang einer legalen Kante zu einem Zielnode wechseln

### Sonderfälle
Mr. X darf später spezielle Aktionen haben:
- `black_ticket`
- `double_move`

Für MVP:
- Black Ticket ja
- Double Move optional, aber besser erst nach Basisversion

---

## 7.3 Kartenregionen
Im MVP nicht ganz Wien, sondern ein kompaktes Spielgebiet.

### Empfohlene Startkarte
`vienna_core`
- zentrale Bezirke / innere Bezirke
- hohe Dichte an Öffis
- gute Spielbarkeit
- kurze Testzyklen

---

## 8. Ticketsystem

## 8.1 Ticketarten
- `walk`
- `subway`
- `tram`
- `bus`
- `black` (nur Mr. X)
- optional später `double`

## 8.2 Startinventar – Vorschlag
### Ermittler
- walk: unbegrenzt oder hohe Anzahl
- subway: 4
- tram: 6
- bus: 6

### Mr. X
- walk: unbegrenzt oder hohe Anzahl
- subway: 5
- tram: 7
- bus: 7
- black: 3

## 8.3 Verwendung
Jeder Zug verbraucht ein Ticket passend zum Edge-Typ.

### Black Ticket
Mr. X kann statt des echten Transportmittels ein `black`-Ticket einsetzen.
Dann wird im öffentlichen Log nicht das tatsächliche Verkehrsmittel angezeigt.

---

## 9. Hidden-Role-Mechanik

## 9.1 Rollenvergabe
Beim Match-Start bestimmt der Server zufällig genau einen Spieler als Mr. X.

### Wichtig
Die Rolle:
- wird nur im Match-State im Durable Object gespeichert
- wird nie an andere Clients geleakt
- darf nicht aus öffentlichen Logs ableitbar sein

## 9.2 Sichtbarkeit
### Ermittler sehen
- alle öffentlichen Informationen
- ihre eigene Position
- bekannte Positionen anderer Spieler
- Reveal-Informationen über Mr. X
- Logs
- Abstimmungsergebnisse

### Mr. X sieht
- dieselben öffentlichen Infos
- zusätzlich seine Rolle
- ggf. Zusatzinfos über Verdachtswerte

---

## 10. Informationsdesign

## 10.1 Public Logs
Die Logs sind zentrales Gameplay.

### Beispiel
- Runde 3: Spieler Blau nutzte Tram
- Runde 3: Spieler Rot nutzte Bus
- Runde 3: Spieler Gelb nutzte ??? 
- Runde 3: Spieler Grün nutzte U-Bahn

Wichtig:
- Logs sollen Spannung erzeugen
- Logs sollen Hinweise liefern
- Logs dürfen Mr. X nicht trivial verraten

## 10.2 Verdachtsmomente
Das Spiel selbst darf Verdacht unterstützen, ohne automatisch die Lösung zu verraten.

### MVP
- manuelle Markierungen: Spieler können andere als verdächtig markieren
- rein kosmetisch / UI-intern

### Später
- Soft Suspicion Score
- aus Bewegungsmustern und Logs

---

## 11. Voting- und Enttarnungsmechanik

## 11.1 Meeting / Abstimmung
Jeder Spieler kann unter bestimmten Bedingungen ein Meeting starten.

### MVP-Regel
- maximal 1 Meeting alle X Runden
- oder pro Spieler maximal 1 Meeting pro Match

## 11.2 Ablauf
1. Meeting startet
2. Diskussionstimer läuft
3. alle Spieler stimmen ab
4. Ergebnis wird serverseitig aufgelöst

## 11.3 Mögliche Ergebnisse
### A. Kein Konsens
- niemand wird enttarnt
- Spiel läuft weiter

### B. Mehrheitsvotum gegen Spieler X
- Rolle wird serverseitig geprüft
- wenn Spieler X Mr. X ist:
  - Mr. X ist enttarnt
  - Hunt-Phase startet oder Ermittler gewinnen direkt, je nach Regelset
- wenn Spieler X nicht Mr. X ist:
  - Fehlvotum
  - optional Strafe für Gruppe oder nur Informationsverlust

## 11.4 MVP-Empfehlung
Ein Fehlvotum entfernt niemanden aus dem Spiel.
Stattdessen:
- Fehlvotum wird angezeigt
- Spiel geht weiter
- soziale Dynamik bleibt erhalten

---

## 12. Match-Zustandsmodell

## 12.1 High-Level State
```ts
type MatchPhase =
  | "lobby"
  | "in_progress"
  | "meeting"
  | "finished";

type Role =
  | "mr_x"
  | "detective";

type TransportType =
  | "walk"
  | "subway"
  | "tram"
  | "bus"
  | "black";

type PlayerColor =
  | "blue"
  | "red"
  | "green"
  | "yellow"
  | "purple"
  | "orange";

12.2 Player

type Player = {
  id: string;
  name: string;
  color: PlayerColor;
  isConnected: boolean;
  role: Role; // server only
  isRevealedAsMrX: boolean;
  currentNodeId: string;
  tickets: {
    walk: number | "infinite";
    subway: number;
    tram: number;
    bus: number;
    black: number;
  };
  hasSubmittedMove: boolean;
  isReady: boolean;
  createdAt: string;
};

12.3 Planned Move

type PlannedMove = {
  playerId: string;
  round: number;
  fromNodeId: string;
  toNodeId: string;
  requestedTransport: "walk" | "subway" | "tram" | "bus";
  appliedTransport: "walk" | "subway" | "tram" | "bus" | "black";
  usedBlackTicket: boolean;
  createdAt: string;
};

12.4 Public Event

type PublicEvent =
  | {
      type: "round_started";
      round: number;
      createdAt: string;
    }
  | {
      type: "player_move_logged";
      round: number;
      playerId: string;
      publicTransport: TransportType | "unknown";
      createdAt: string;
    }
  | {
      type: "mr_x_trace_reveal";
      round: number;
      revealKind: "district" | "zone" | "exact_node";
      districtId?: string;
      nodeId?: string;
      createdAt: string;
    }
  | {
      type: "meeting_called";
      round: number;
      calledByPlayerId: string;
      createdAt: string;
    }
  | {
      type: "vote_result";
      round: number;
      accusedPlayerId: string;
      votes: Record<string, string>;
      wasMrX: boolean;
      createdAt: string;
    }
  | {
      type: "match_finished";
      winner: "mr_x" | "detectives";
      reason: string;
      createdAt: string;
    };


⸻

13. Architektur

13.1 Backend-Prinzip

Ein Match wird von genau einem Durable Object verwaltet.

Cloudflare positioniert Durable Objects explizit als Koordinationspunkt für Anwendungen wie Multiplayer-Spiele; außerdem unterstützen sie WebSockets, inklusive einer Hibernation-Variante zur kosteneffizienteren Verbindungshaltung.  ￼

Warum Durable Objects
	•	atomare Spielauflösung
	•	keine Race Conditions zwischen Zügen
	•	ein zentraler State pro Match
	•	ideal für Lobby + Match + Echtzeit-Events

13.2 Komponenten

Cloudflare Worker

Verantwortlich für:
	•	Auth / Gast-Login
	•	Lobby-Endpunkte
	•	Routing zum passenden Durable Object
	•	Karten-Metadaten
	•	abgeschlossene Matches
	•	Replay-Metadaten

Durable Object GameRoom

Verantwortlich für:
	•	Lobby-State
	•	Match-State
	•	Rollenzuweisung
	•	Rundenauflösung
	•	Move-Validierung
	•	Vote-Validierung
	•	Siegbedingungen
	•	Broadcasting an Clients

D1

Verantwortlich für:
	•	Spielerprofile
	•	Lobbies
	•	Match-Metadaten
	•	Replay-Metadaten
	•	Kartenversionen

Optional R2

Nicht nötig für MVP, später für:
	•	Replays
	•	große statische Graph-Dateien
	•	Exportdateien

⸻

14. Kommunikationsmodell

14.1 MVP-Empfehlung

Primär:
	•	HTTP APIs
	•	kurzes Polling für State-Refresh

Optional zusätzlich:
	•	WebSockets für Lobby und Match-Live-Updates

Empfehlung

API so designen, dass beides möglich ist:
	•	zuerst HTTP + Polling
	•	später WebSockets ergänzen

Grund

Cloudflare Free hat Request-Limits. Deshalb:
	•	wenig Polling
	•	kompakte Responses
	•	Deltas statt riesiger Vollzustände, wenn sinnvoll  ￼

⸻

15. API-Design

15.1 Auth / Session

POST /api/guest/login

Erstellt eine Gast-Session.

Request:

{
  "displayName": "Matthias"
}

Response:

{
  "sessionToken": "jwt-or-random-token",
  "player": {
    "id": "p_123",
    "displayName": "Matthias"
  }
}


⸻

15.2 Lobby

POST /api/lobbies

Neue Lobby erstellen.

Request:

{
  "mapId": "vienna_core",
  "maxPlayers": 5,
  "ruleset": "hidden_mrx_classic"
}

Response:

{
  "lobbyId": "l_123",
  "joinCode": "WIEN42"
}

POST /api/lobbies/{joinCode}/join

Lobby beitreten.

POST /api/lobbies/{lobbyId}/start

Lobby starten.
Nur Host darf starten.

GET /api/lobbies/{lobbyId}

Lobby-State laden.

⸻

15.3 Match

GET /api/matches/{matchId}/state

Liefert den für den anfragenden Spieler gefilterten State.

POST /api/matches/{matchId}/moves

Zug einreichen.

Request:

{
  "fromNodeId": "node_100",
  "toNodeId": "node_105",
  "transport": "tram",
  "useBlackTicket": false
}

POST /api/matches/{matchId}/ready

Spieler markiert Zug als final.

POST /api/matches/{matchId}/meeting

Meeting starten.

POST /api/matches/{matchId}/vote

Stimme abgeben.

Request:

{
  "accusedPlayerId": "p_456"
}

GET /api/matches/{matchId}/events?cursor=...

Öffentliche Event-Liste abrufen.

⸻

16. State-Projektion

16.1 Grundsatz

Der Client darf niemals den vollständigen Match-State bekommen.

Es gibt intern einen Private Full State und pro Spieler einen Projected State.

Private Full State

Enthält:
	•	Rollen
	•	echte Position von Mr. X
	•	geplante Züge
	•	interne Reveal-Timer
	•	vollständige Tickets aller Spieler
	•	Debug-Infos

Projected State für Ermittler

Enthält nicht:
	•	Rolle von Mr. X
	•	echte geheime Zuginfos von Mr. X
	•	nicht öffentliche Daten anderer Spieler

Projected State für Mr. X

Enthält:
	•	eigene Rolle
	•	eigene Sonderinfos
	•	nur öffentliche Infos plus seine erlaubten privaten Infos

⸻

17. Serverlogik

17.1 Move-Validierung

Beim Einreichen eines Zugs prüfen:
	1.	Spiel läuft?
	2.	Spieler ist Teil des Matches?
	3.	Spieler darf aktuell handeln?
	4.	fromNodeId entspricht aktueller Position?
	5.	Edge von fromNodeId zu toNodeId existiert?
	6.	Transport passt zur Edge?
	7.	passendes Ticket vorhanden?
	8.	useBlackTicket nur für Mr. X erlaubt?
	9.	Zug noch nicht final abgeschlossen?

Wenn alles passt:
	•	Zug temporär speichern
	•	noch nicht anwenden
	•	erst bei Rundenauflösung atomar anwenden

⸻

17.2 Rundenauflösung

Wenn alle aktiven Spieler ready sind:
	1.	alle geplanten Züge lesen
	2.	Züge validieren
	3.	Tickets abziehen
	4.	neue Positionen setzen
	5.	Public Events erzeugen
	6.	Reveal-Regeln anwenden
	7.	Kollisionen prüfen
	8.	Siegbedingungen prüfen
	9.	nächste Runde starten

⸻

17.3 Kollisionen

MVP-Regel

Wenn Mr. X nach der Rundenauflösung auf demselben Node steht wie ein Ermittler:
	•	Ermittler gewinnen sofort

Optional später:
	•	Swap-Kollisionen
	•	Mid-edge Begegnungen
	•	Blockaden

⸻

18. Datenbankmodell D1

18.1 Tabellen

players

CREATE TABLE players (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

sessions

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

lobbies

CREATE TABLE lobbies (
  id TEXT PRIMARY KEY,
  host_player_id TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  map_id TEXT NOT NULL,
  ruleset TEXT NOT NULL,
  status TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

lobby_players

CREATE TABLE lobby_players (
  lobby_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (lobby_id, player_id)
);

matches

CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  lobby_id TEXT NOT NULL,
  durable_object_name TEXT NOT NULL,
  map_id TEXT NOT NULL,
  ruleset TEXT NOT NULL,
  winner TEXT,
  win_reason TEXT,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

match_players

CREATE TABLE match_players (
  match_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  color TEXT NOT NULL,
  role_revealed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, player_id)
);

replays

CREATE TABLE replays (
  match_id TEXT PRIMARY KEY,
  replay_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);


⸻

19. Mobile UX

19.1 Hauptscreens

A. Home
	•	Spiel erstellen
	•	Spiel beitreten
	•	Tutorial
	•	letzte Matches

B. Lobby
	•	Join-Code
	•	Spielerliste
	•	Host-Steuerung
	•	Kartenvorschau
	•	Startbutton

C. Match Screen
	•	Karte
	•	eigene Position
	•	sichtbare andere Spieler
	•	Ticketleiste
	•	Rundenanzeige
	•	Log-Feed
	•	Zugauswahl
	•	Button für Meeting

D. Move Picker
	•	Bottom Sheet
	•	listet alle legalen Züge
	•	gruppiert nach Transportmittel

E. Voting Screen
	•	Spielerliste
	•	Countdown
	•	Vote-Status

F. Match Result
	•	Gewinner
	•	Reveal: Wer war Mr. X?
	•	komplette Route von Mr. X
	•	Replay-Timeline

⸻

19.2 UX-Prinzipien
	•	nicht GIS-artig
	•	nicht überladen
	•	Zielauswahl über legale Optionen
	•	Karte als Kontext, nicht als einziges Eingabeelement
	•	mobile Bedienung mit Daumen
	•	wichtige Informationen im unteren Bereich

⸻

20. Karten-Preprocessing

20.1 Offline-Pipeline

Erzeuge vor dem Deploy einen JSON-Graphen.

Eingaben
	•	Haltestellen
	•	Linienverbindungen
	•	optional OSM-Fußweg-Nähen
	•	definierte Spielzonen / Bezirke

Ausgabe

maps/vienna_core.json

Struktur:

{
  "mapId": "vienna_core",
  "version": 1,
  "nodes": [
    {
      "id": "node_1",
      "name": "Karlsplatz",
      "type": "hub",
      "lat": 48.200,
      "lon": 16.369,
      "district": "04"
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "from": "node_1",
      "to": "node_2",
      "transport": "subway",
      "line": "U1"
    }
  ]
}


⸻

21. Anti-Cheat

21.1 Regeln
	•	Server ist Source of Truth
	•	Client validiert nur UX-seitig vor
	•	nie Rolleninfos im Client bundlen
	•	nie vollständigen State an Ermittler senden
	•	jede Aktion serverseitig prüfen

21.2 Logging

Serverseitiges Audit-Logging für:
	•	Match-Start
	•	Rollenzuweisung
	•	Moves
	•	Voting
	•	Match-Ende

⸻

22. Nicht-Ziele für MVP

Diese Dinge jetzt bewusst nicht bauen:
	•	GPS / Real-World Mode
	•	Push Notifications
	•	Freundelisten
	•	Skill-System
	•	Cosmetics
	•	Voice Chat
	•	Matchmaking mit Fremden
	•	Live-Routing gegen externe APIs pro Zug
	•	Admin-Backend
	•	Analytics-Dashboard
	•	mehrere Städte

⸻

23. Empfohlene Projektstruktur

/apps
  /mobile
    /src
      /features
        /auth
        /lobby
        /match
        /map
        /voting
      /components
      /services
      /state
      /theme

/packages
  /shared
    /src
      /types
      /schemas
      /rules
      /maps

  /map-tools
    /src
      /importers
      /graph-builder
      /exporters

/apps
  /worker
    /src
      /api
      /lib
      /db
      /durable
        GameRoom.ts
      /auth
      /projection
      /rules
      index.ts

/infrastructure
  wrangler.toml
  migrations/


⸻

24. Tech-Vorgaben

24.1 Sprache
	•	TypeScript überall, wo möglich

24.2 Validierung
	•	Zod für Request/Response-Schemas

24.3 Mobile Stack

Codex soll zunächst eine mobile App mit einem cross-platform Stack erzeugen.

Präferenz
	•	React Native + Expo falls praktikabel
	•	alternativ Flutter, falls explizit gewählt
	•	alternativ SwiftUI nur wenn iOS-first priorisiert wird

Für dieses Projekt

Empfehlung: React Native + TypeScript, weil:
	•	schneller MVP
	•	Android + iOS mit einem Codebestand
	•	leichter API-getrieben

24.4 Backend Stack
	•	Cloudflare Workers
	•	Durable Objects
	•	D1
	•	Wrangler
	•	Vitest für Rule-Engine und API-Tests

⸻

25. Implementierungsreihenfolge

Phase 1 – Foundations
	1.	Monorepo anlegen
	2.	shared types + schemas
	3.	Worker Grundgerüst
	4.	D1 Schema + Migrations
	5.	Gast-Login
	6.	Lobby erstellen / joinen

Phase 2 – Match Engine
	1.	Durable Object GameRoom
	2.	Match-State
	3.	Rollenzuweisung
	4.	Move-Validierung
	5.	Rundenauflösung
	6.	Siegbedingungen

Phase 3 – Hidden Role + Voting
	1.	State-Projektion
	2.	Public Logs
	3.	Meeting-Endpunkte
	4.	Voting
	5.	Reveal-Logik

Phase 4 – Mobile UI
	1.	Home
	2.	Lobby
	3.	Match Screen
	4.	Move Picker
	5.	Voting Screen
	6.	Match Result

Phase 5 – Polish
	1.	Replay
	2.	Reconnect
	3.	Fehlerbehandlung
	4.	kompakteres Polling / Live-Updates

⸻

26. Tests

26.1 Unit Tests
	•	Ticket-Verbrauch
	•	Move-Validierung
	•	Reveal-Regeln
	•	Siegbedingungen
	•	Vote-Auswertung

26.2 Integration Tests
	•	Lobby flow
	•	Match-Start
	•	mehrere Spieler submitten Moves
	•	Runde wird korrekt aufgelöst
	•	Ermittler sehen keine geheimen Infos

26.3 Security Tests
	•	Ermittler bekommt nie role=mr_x
	•	Ermittler bekommt nie echte geheime Mr.-X-Position
	•	Black-Ticket-Log korrekt maskiert

⸻

27. Codex-Auftrag

Codex soll ein initiales, lauffähiges MVP-Repository erzeugen mit:
	1.	Monorepo-Struktur
	2.	React-Native-Mobile-App mit Basisnavigation
	3.	Cloudflare Worker API
	4.	Durable Object GameRoom
	5.	D1 Migrationen
	6.	Shared TypeScript Types
	7.	Erstem spielbaren Flow:
	•	Gast-Login
	•	Lobby erstellen
	•	Lobby beitreten
	•	Match starten
	•	zufällige Rollenzuweisung
	•	legale Züge auswählen
	•	Runde auflösen
	•	public logs anzeigen
	•	Meeting/Voting Basisversion
	•	Match-Ende

Wichtig

Der Code soll:
	•	sauber typisiert sein
	•	modulare Architektur haben
	•	keine geheimen Match-Daten an falsche Clients senden
	•	auf Cloudflare Free lauffähig bleiben
	•	spätere WebSocket-Erweiterung vorbereiten

⸻

28. Konkrete Codex-Implementierungsanforderungen

A. Erzeuge zuerst das Backend-Grundgerüst
	•	Worker
	•	Durable Object
	•	D1
	•	Shared Schemas

B. Implementiere danach die Endpunkte
	•	guest login
	•	create lobby
	•	join lobby
	•	start match
	•	get match state
	•	submit move
	•	ready
	•	meeting
	•	vote

C. Implementiere danach die Rule Engine
	•	start positions
	•	ticket handling
	•	move validation
	•	round resolution
	•	reveal schedule
	•	win conditions

D. Implementiere danach die Mobile Screens
	•	minimalistisch, aber funktional
	•	klare State-Anzeige
	•	Bottom Sheet für Züge
	•	Log Feed

E. Implementiere Tests
	•	mindestens die zentrale Match-Engine

⸻

29. Offene spätere Erweiterungen

Nicht jetzt umsetzen, aber Architektur offen halten für:
	•	GPS City Mode
	•	Wien live draußen spielen
	•	Bezirkskontrolle
	•	Items / Fähigkeiten
	•	Push Notifications
	•	WebSocket-Livebetrieb
	•	mehrere Karten
	•	andere Städte
	•	private Turniere

⸻

30. Definition of Done für MVP

Das MVP ist fertig, wenn:
	1.	3 bis 5 Spieler ein Match starten können
	2.	genau 1 Spieler serverseitig als Mr. X bestimmt wird
	3.	andere Spieler diese Identität nicht kennen
	4.	alle Züge regelkonform validiert werden
	5.	Logs Hinweise geben, aber Mr. X nicht direkt verraten
	6.	Voting möglich ist
	7.	Fang- und Siegbedingungen funktionieren
	8.	Match-Ende mit Reveal möglich ist
	9.	das Ganze lokal und auf Cloudflare deploybar ist
	10.	grundlegende Tests grün sind

Ein paar Punkte daraus stützen sich auf den aktuellen Stand der Cloudflare-Plattform: Workers Free hat derzeit 100.000 Requests pro Tag, Durable Objects sind auf dem Free-Plan verfügbar, dort aber nur SQLite-basiert; D1 hat auf Free aktuell bis zu 10 Datenbanken pro Account und 500 MB pro Datenbank. Für WebSocket-lastige Match-Logik sind Durable Objects ausdrücklich für koordinierte Anwendungen wie Multiplayer-Spiele gedacht, und Cloudflare empfiehlt bei WebSocket-Servern die Hibernation-Variante für bessere Kosteneffizienz.  [oai_citation:4‡Cloudflare Docs](https://developers.cloudflare.com/workers/platform/limits/?utm_source=chatgpt.com)

Wenn du willst, mache ich dir daraus als Nächstes noch eine **zweite Datei `TASKS.md` mit konkreten Codex-Arbeitspaketen und Prompts pro Phase**.
