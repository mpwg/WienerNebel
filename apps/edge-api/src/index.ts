import {
  createLobbySchema,
  createLobbyResponseSchema,
  getMatchStateParamsSchema,
  getPlayerMatchStateQuerySchema,
  joinLobbyResponseSchema,
  joinLobbySchema,
  meetingResponseSchema,
  playerMatchStateResponseSchema,
  publicMatchStateResponseSchema,
  readyResponseSchema,
  startMatchResponseSchema,
  startMatchSchema,
  submitMoveResponseSchema,
  submitMoveSchema,
  voteResponseSchema,
  voteSchema,
  readySchema,
  meetingSchema,
  type CreateLobbyRequest,
  type JoinLobbyRequest,
  type MeetingRequest,
  type ReadyRequest,
  type StartMatchRequest,
  type SubmitMoveRequest,
  type VoteRequest
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
    if (request.method === "OPTIONS") {
      return withCors(
        new Response(null, {
          status: 204
        })
      );
    }

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

    if (request.method === "POST" && url.pathname.endsWith("/start")) {
      const matchId = url.pathname.split("/")[2];
      getMatchStateParamsSchema.parse({ matchId });
      const body = startMatchSchema.parse(
        (await request.json()) as StartMatchRequest
      );
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const response = await stub.fetch(
        new Request("https://game-room.internal/match/start", {
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

      return json(startMatchResponseSchema.parse(payload));
    }

    if (request.method === "POST" && url.pathname.endsWith("/move")) {
      const matchId = url.pathname.split("/")[2];
      getMatchStateParamsSchema.parse({ matchId });
      const body = submitMoveSchema.parse(
        (await request.json()) as SubmitMoveRequest
      );
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const response = await stub.fetch(
        new Request("https://game-room.internal/match/move", {
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

      return json(submitMoveResponseSchema.parse(payload));
    }

    if (request.method === "POST" && url.pathname.endsWith("/ready")) {
      const matchId = url.pathname.split("/")[2];
      getMatchStateParamsSchema.parse({ matchId });
      const body = readySchema.parse((await request.json()) as ReadyRequest);
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const response = await stub.fetch(
        new Request("https://game-room.internal/match/ready", {
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

      return json(readyResponseSchema.parse(payload));
    }

    if (request.method === "POST" && url.pathname.endsWith("/meeting")) {
      const matchId = url.pathname.split("/")[2];
      getMatchStateParamsSchema.parse({ matchId });
      const body = meetingSchema.parse((await request.json()) as MeetingRequest);
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const response = await stub.fetch(
        new Request("https://game-room.internal/match/meeting", {
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

      return json(meetingResponseSchema.parse(payload));
    }

    if (request.method === "POST" && url.pathname.endsWith("/vote")) {
      const matchId = url.pathname.split("/")[2];
      getMatchStateParamsSchema.parse({ matchId });
      const body = voteSchema.parse((await request.json()) as VoteRequest);
      const objectId = env.GAME_ROOM.idFromName(matchId);
      const stub = env.GAME_ROOM.get(objectId);
      const response = await stub.fetch(
        new Request("https://game-room.internal/match/vote", {
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

      return json(voteResponseSchema.parse(payload));
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
  return withCors(
    new Response(JSON.stringify(payload, null, 2), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    })
  );
}

function withCors(response: Response): Response {
  response.headers.set("access-control-allow-origin", "*");
  response.headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
  response.headers.set("access-control-allow-headers", "content-type");
  response.headers.set("access-control-max-age", "86400");

  return response;
}
