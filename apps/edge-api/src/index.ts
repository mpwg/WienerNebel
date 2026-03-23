import {
  createLobbySchema,
  createLobbyResponseSchema,
  getMatchStateParamsSchema,
  getPlayerMatchStateQuerySchema,
  joinLobbyResponseSchema,
  joinLobbySchema,
  publicMatchStateResponseSchema,
  playerMatchStateResponseSchema,
  type CreateLobbyRequest,
  type JoinLobbyRequest
} from "@wiener-nebel/contracts";
import { GameRoom } from "./durable-objects/game-room";

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
}

export { GameRoom };

function createJoinCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "edge-api" });
    }

    if (request.method === "POST" && url.pathname === "/lobbies") {
      const body = createLobbySchema.parse(
        (await request.json()) as CreateLobbyRequest
      );
      const matchId = crypto.randomUUID();
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);

      const response = await stub.fetch(
        new Request("https://game-room.internal/lobby/create", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            matchId,
            joinCode: createJoinCode(),
            hostId: body.hostId,
            hostName: body.hostName,
            mapId: body.mapId,
            maxRounds: body.maxRounds,
            minPlayers: body.minPlayers,
            maxPlayers: body.maxPlayers
          })
        })
      );

      const payload = createLobbyResponseSchema.parse(await response.json());

      return json(
        {
          matchId,
          lobby: payload.lobby
        },
        201
      );
    }

    if (request.method === "POST" && url.pathname === "/lobbies/join") {
      const body = joinLobbySchema.parse((await request.json()) as JoinLobbyRequest);
      const objectId = env.GAME_ROOM.idFromName(body.matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const response = await stub.fetch(
        new Request("https://game-room.internal/lobby/join", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(body)
        })
      );

      const payload = await response.json();

      if (!response.ok) {
        return json(payload, response.status);
      }

      return json(joinLobbyResponseSchema.parse(payload));
    }

    if (
      request.method === "GET" &&
      url.pathname.startsWith("/matches/") &&
      url.pathname.endsWith("/state")
    ) {
      const matchId = url.pathname.split("/")[2];
      getMatchStateParamsSchema.parse({ matchId });
      const playerId = url.searchParams.get("playerId");

      if (playerId) {
        getPlayerMatchStateQuerySchema.parse({ playerId });
      }

      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const search = playerId
        ? `?playerId=${encodeURIComponent(playerId)}`
        : "";
      const response = await stub.fetch(
        new Request(`https://game-room.internal/state${search}`)
      );
      const payload = await response.json();

      if (!response.ok) {
        return json(payload, response.status);
      }

      return json(
        playerId
          ? playerMatchStateResponseSchema.parse(payload)
          : publicMatchStateResponseSchema.parse(payload)
      );
    }

    return json({ error: "not_found" }, 404);
  }
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}
