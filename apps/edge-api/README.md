# Edge-API-Testumgebung

## Zweck

`apps/edge-api` stellt die lokale Worker-Testumgebung für Lobby- und Match-Endpunkte bereit. Die Web-Testoberfläche nutzt diese API direkt im Browser.

## Start

Aus dem Repository-Root:

```bash
corepack pnpm dev:test:edge
```

Oder direkt im Paket:

```bash
corepack pnpm --filter @wiener-nebel/edge-api dev
```

Die lokale API läuft danach standardmäßig unter [http://127.0.0.1:8787](http://127.0.0.1:8787).

## Zusammen mit der Web-App starten

```bash
corepack pnpm dev:test
```

Damit starten Web und Edge-API parallel.

## Relevante lokale Endpunkte

- `GET /health`
- `POST /lobbies`
- `POST /lobbies/join`
- `POST /matches/:id/start`
- `GET /matches/:id/state`
- `POST /matches/:id/move`
- `POST /matches/:id/ready`
- `POST /matches/:id/meeting`
- `POST /matches/:id/vote`

## Hinweise

- CORS ist für lokale Browser-Tests aktiviert.
- Die API ist aktuell auf einen MVP-Testpfad ausgelegt, nicht auf vollständige Produktionsregeln.
- Persistenz läuft derzeit über den Worker-Zustand und noch nicht über die spätere D1-Integration.
