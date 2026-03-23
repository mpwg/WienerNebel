import {
  createLobbySchema,
  type CreateLobbyRequest
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

      await stub.fetch(
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
            maxRounds: body.maxRounds
          })
        })
      );

      return json({ matchId }, 201);
    }

    if (
      request.method === "GET" &&
      url.pathname.startsWith("/matches/") &&
      url.pathname.endsWith("/state")
    ) {
      const matchId = url.pathname.split("/")[2];
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);

      return stub.fetch(new Request("https://game-room.internal/state"));
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
