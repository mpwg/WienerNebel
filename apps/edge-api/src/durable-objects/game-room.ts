import {
  joinLobbySchema,
  meetingSchema,
  readySchema,
  startMatchSchema,
  submitMoveSchema,
  voteSchema
} from "@wiener-nebel/contracts";
import { getMapById, type GameMap } from "@wiener-nebel/map-data";
import {
  castVote,
  createLobbyState,
  createPlayerMatchView,
  createPublicMatchView,
  joinLobby,
  markPlayerReady,
  resolvePlannedRound,
  startMatch,
  startMeeting,
  submitPlayerMove,
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

    try {
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

        await this.persistState();

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

        await this.persistState();

        return json({ lobby: createPublicMatchView(this.matchState) }, 200);
      }

      if (request.method === "POST" && url.pathname === "/match/start") {
        if (!this.matchState) {
          return json({ error: "match_not_found" }, 404);
        }

        const body = startMatchSchema.parse(await request.json());
        const map = getMapById(this.matchState.mapId);

        if (!map) {
          return json({ error: "unknown_map" }, 400);
        }

        this.matchState = startMatch(this.matchState, {
          requestedByPlayerId: body.playerId,
          mrXPlayerId: body.mrXPlayerId ?? selectMrXPlayerId(this.matchState),
          startPositions: createStartPositions(this.matchState, map)
        });

        await this.persistState();

        return json({ match: createPublicMatchView(this.matchState) }, 200);
      }

      if (request.method === "POST" && url.pathname === "/match/move") {
        if (!this.matchState) {
          return json({ error: "match_not_found" }, 404);
        }

        const body = submitMoveSchema.parse(await request.json());

        this.matchState = submitPlayerMove(this.matchState, {
          playerId: body.playerId,
          toNodeId: body.move.toNodeId,
          ticket: body.move.ticket
        });

        await this.persistState();

        return this.jsonPlayerView(body.playerId);
      }

      if (request.method === "POST" && url.pathname === "/match/ready") {
        if (!this.matchState) {
          return json({ error: "match_not_found" }, 404);
        }

        const body = readySchema.parse(await request.json());
        this.matchState = markPlayerReady(this.matchState, body.playerId);

        if (this.matchState.players.every((player) => !player.eliminated ? player.ready && player.plannedMove !== null : true)) {
          this.matchState = resolvePlannedRound(this.matchState);
        }

        await this.persistState();

        return this.jsonPlayerView(body.playerId);
      }

      if (request.method === "POST" && url.pathname === "/match/meeting") {
        if (!this.matchState) {
          return json({ error: "match_not_found" }, 404);
        }

        const body = meetingSchema.parse(await request.json());
        this.matchState = startMeeting(this.matchState, body);

        await this.persistState();

        return json({ match: createPublicMatchView(this.matchState) }, 200);
      }

      if (request.method === "POST" && url.pathname === "/match/vote") {
        if (!this.matchState) {
          return json({ error: "match_not_found" }, 404);
        }

        const body = voteSchema.parse(await request.json());
        this.matchState = castVote(this.matchState, body);

        await this.persistState();

        return json({ match: createPublicMatchView(this.matchState) }, 200);
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
    } catch (error) {
      return json(
        {
          error: error instanceof Error ? error.message : "unexpected_error"
        },
        400
      );
    }
  }

  private async persistState(): Promise<void> {
    await this.state.storage.put("match-state", this.matchState);
  }

  private jsonPlayerView(playerId: string): Response {
    if (!this.matchState) {
      return json({ error: "match_not_found" }, 404);
    }

    const match = createPlayerMatchView(this.matchState, playerId);

    if (!match) {
      return json({ error: "player_not_found" }, 404);
    }

    return json({ match }, 200);
  }
}

function createStartPositions(state: MatchState, map: GameMap): Record<string, string> {
  return Object.fromEntries(
    state.players.map((player, index) => [
      player.id,
      map.nodes[index % map.nodes.length]?.id ?? "karlsplatz"
    ])
  );
}

function selectMrXPlayerId(state: MatchState): string {
  return state.players[0]?.id ?? "";
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}
