export type MatchStage =
  | "lobby"
  | "planning"
  | "resolving"
  | "meeting"
  | "finished";

export type PlayerRole = "mr_x" | "investigator";

export type TicketType = "walk" | "subway" | "tram" | "bus" | "black";

export interface PlayerState {
  id: string;
  name: string;
  role: PlayerRole;
  nodeId: string;
  ready: boolean;
  tickets: Record<TicketType, number>;
}

export interface PublicLogEntry {
  round: number;
  message: string;
}

export interface MatchState {
  id: string;
  mapId: string;
  stage: MatchStage;
  round: number;
  maxRounds: number;
  createdAt: string;
  players: PlayerState[];
  publicLog: PublicLogEntry[];
}

export interface CreateLobbyInput {
  matchId: string;
  host: {
    id: string;
    name: string;
  };
  mapId: string;
  maxRounds: number;
}

const DEFAULT_TICKETS: Record<TicketType, number> = {
  walk: 4,
  subway: 4,
  tram: 6,
  bus: 4,
  black: 0
};

export function createLobbyState(input: CreateLobbyInput): MatchState {
  return {
    id: input.matchId,
    mapId: input.mapId,
    stage: "lobby",
    round: 0,
    maxRounds: input.maxRounds,
    createdAt: new Date().toISOString(),
    players: [
      {
        id: input.host.id,
        name: input.host.name,
        role: "investigator",
        nodeId: "karlsplatz",
        ready: false,
        tickets: { ...DEFAULT_TICKETS }
      }
    ],
    publicLog: [
      {
        round: 0,
        message: `${input.host.name} hat die Lobby erstellt.`
      }
    ]
  };
}

export function markPlayerReady(
  state: MatchState,
  playerId: string
): MatchState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, ready: true } : player
    )
  };
}
