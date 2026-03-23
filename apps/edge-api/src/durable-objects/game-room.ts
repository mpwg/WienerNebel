import { joinLobbySchema } from "@wiener-nebel/contracts";
import { getMapById } from "@wiener-nebel/map-data";
import {
  createLobbyState,
  createPlayerMatchView,
  createPublicMatchView,
  joinLobby,
  type MatchState
} from "@wiener-nebel/domain";

interface LobbyCreatePayload {
  matchId: string;
  joinCode: string;
  hostId: string;
  hostName: string;
  mapId: string;
  maxRounds: number;
  minPlayers?: number;
  maxPlayers?: number;
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
        joinCode: body.joinCode,
        mapId: map.id,
        matchId: body.matchId,
        maxRounds: body.maxRounds,
        minPlayers: body.minPlayers,
        maxPlayers: body.maxPlayers
      });

      await this.state.storage.put("match-state", this.matchState);

      return json({ lobby: createPublicMatchView(this.matchState) }, 201);
    }

    if (request.method === "POST" && url.pathname === "/lobby/join") {
      if (!this.matchState) {
        return json({ error: "match_not_found" }, 404);
      }

      const body = joinLobbySchema.parse(await request.json());

      if (body.joinCode !== this.matchState.joinCode) {
        return json({ error: "join_code_mismatch" }, 403);
      }

      this.matchState = joinLobby(this.matchState, {
        player: {
          id: body.playerId,
          name: body.playerName
        }
      });

      await this.state.storage.put("match-state", this.matchState);

      return json({ lobby: createPublicMatchView(this.matchState) }, 200);
    }

    if (request.method === "GET" && url.pathname === "/state") {
      if (!this.matchState) {
        return json({ error: "match_not_found" }, 404);
      }

      const playerId = url.searchParams.get("playerId");

      if (playerId) {
        const match = createPlayerMatchView(this.matchState, playerId);

        if (!match) {
          return json({ error: "player_not_found" }, 404);
        }

        return json({ match });
      }

      return json({ match: createPublicMatchView(this.matchState) });
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
