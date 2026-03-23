import { getMapById } from "@wiener-nebel/map-data";
import {
  createLobbyState,
  createPublicMatchView,
  type MatchState
} from "@wiener-nebel/domain";

interface LobbyCreatePayload {
  matchId: string;
  hostId: string;
  hostName: string;
  mapId: string;
  maxRounds: number;
}

export class GameRoom {
  private matchState: MatchState | null = null;

  constructor(private readonly state: DurableObjectState) {
    void this.state.blockConcurrencyWhile(async () => {
      const stored =
        (await this.state.storage.get<MatchState>("match-state")) ?? null;
      this.matchState = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/lobby/create") {
      const body = (await request.json()) as LobbyCreatePayload;
      const map = getMapById(body.mapId);

      if (!map) {
        return json({ error: "unknown_map" }, 400);
      }

      this.matchState = createLobbyState({
        host: {
          id: body.hostId,
          name: body.hostName
        },
        mapId: map.id,
        matchId: body.matchId,
        maxRounds: body.maxRounds
      });

      await this.state.storage.put("match-state", this.matchState);

      return json(createPublicMatchView(this.matchState), 201);
    }

    if (request.method === "GET" && url.pathname === "/state") {
      if (!this.matchState) {
        return json({ error: "match_not_found" }, 404);
      }

      return json(createPublicMatchView(this.matchState));
    }

    return json({ error: "not_found" }, 404);
  }
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}
