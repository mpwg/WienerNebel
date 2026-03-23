export type MatchStage =
  | "lobby"
  | "planning"
  | "resolving"
  | "meeting"
  | "finished";

export type PlayerRole = "mr_x" | "investigator";

export type TicketType = "walk" | "subway" | "tram" | "bus" | "black";

export type NodeId = string;

export interface MatchConfig {
  minPlayers: number;
  maxPlayers: number;
  maxRounds: number;
  revealRounds: number[];
}

export interface PlannedMove {
  type: "move";
  round: number;
  fromNodeId: NodeId;
  toNodeId: NodeId;
  ticket: TicketType;
}

export interface PlayerState {
  id: string;
  name: string;
  role: PlayerRole;
  isHost: boolean;
  nodeId: NodeId;
  ready: boolean;
  connected: boolean;
  eliminated: boolean;
  tickets: Record<TicketType, number>;
  plannedMove: PlannedMove | null;
}

export interface PublicLogEntry {
  round: number;
  message: string;
}

export interface RoundResolution {
  round: number;
  moves: PlannedMove[];
  revealMrXPosition: boolean;
}

export interface MatchState {
  id: string;
  joinCode: string;
  mapId: string;
  stage: MatchStage;
  round: number;
  config: MatchConfig;
  createdAt: string;
  updatedAt: string;
  players: PlayerState[];
  publicLog: PublicLogEntry[];
  roundHistory: RoundResolution[];
  winner: "mr_x" | "investigators" | null;
}

export interface CreateLobbyInput {
  matchId: string;
  joinCode: string;
  host: {
    id: string;
    name: string;
  };
  mapId: string;
  maxRounds?: number;
  minPlayers?: number;
  maxPlayers?: number;
  revealRounds?: number[];
}

export interface JoinLobbyInput {
  player: {
    id: string;
    name: string;
  };
}

export interface StartMatchInput {
  mrXPlayerId: string;
  startPositions: Record<string, NodeId>;
}

export interface SubmitMoveInput {
  playerId: string;
  toNodeId: NodeId;
  ticket: TicketType;
}

const DEFAULT_TICKETS: Record<TicketType, number> = {
  walk: 4,
  subway: 4,
  tram: 6,
  bus: 4,
  black: 0
};

const DEFAULT_MR_X_TICKETS: Record<TicketType, number> = {
  walk: 4,
  subway: 4,
  tram: 6,
  bus: 4,
  black: 2
};

const DEFAULT_REVEAL_ROUNDS = [3, 8, 13, 18];
const DEFAULT_MIN_PLAYERS = 3;
const DEFAULT_MAX_PLAYERS = 6;
const DEFAULT_MAX_ROUNDS = 20;
const DEFAULT_START_NODE = "karlsplatz";

function createPlayerState(input: {
  id: string;
  name: string;
  role: PlayerRole;
  isHost: boolean;
  nodeId?: NodeId;
}): PlayerState {
  return {
    id: input.id,
    name: input.name,
    role: input.role,
    isHost: input.isHost,
    nodeId: input.nodeId ?? DEFAULT_START_NODE,
    ready: false,
    connected: true,
    eliminated: false,
    tickets:
      input.role === "mr_x"
        ? { ...DEFAULT_MR_X_TICKETS }
        : { ...DEFAULT_TICKETS },
    plannedMove: null
  };
}

function touchState(state: MatchState): MatchState {
  return {
    ...state,
    updatedAt: new Date().toISOString()
  };
}

function requireLobbyStage(state: MatchState): void {
  if (state.stage !== "lobby") {
    throw new Error("Lobby kann nur im Lobby-Status verändert werden.");
  }
}

function requirePlanningStage(state: MatchState): void {
  if (state.stage !== "planning") {
    throw new Error("Züge können nur in der Planungsphase gesetzt werden.");
  }
}

function requirePlayer(state: MatchState, playerId: string): PlayerState {
  const player = state.players.find((entry) => entry.id === playerId);

  if (!player) {
    throw new Error(`Spieler ${playerId} existiert nicht.`);
  }

  return player;
}

export function createLobbyState(input: CreateLobbyInput): MatchState {
  return {
    id: input.matchId,
    joinCode: input.joinCode,
    mapId: input.mapId,
    stage: "lobby",
    round: 0,
    config: {
      minPlayers: input.minPlayers ?? DEFAULT_MIN_PLAYERS,
      maxPlayers: input.maxPlayers ?? DEFAULT_MAX_PLAYERS,
      maxRounds: input.maxRounds ?? DEFAULT_MAX_ROUNDS,
      revealRounds: input.revealRounds ?? DEFAULT_REVEAL_ROUNDS
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    players: [
      createPlayerState({
        id: input.host.id,
        name: input.host.name,
        role: "investigator",
        isHost: true
      })
    ],
    publicLog: [
      {
        round: 0,
        message: `${input.host.name} hat die Lobby erstellt.`
      }
    ],
    roundHistory: [],
    winner: null
  };
}

export function joinLobby(
  state: MatchState,
  input: JoinLobbyInput
): MatchState {
  requireLobbyStage(state);

  if (state.players.some((player) => player.id === input.player.id)) {
    throw new Error(`Spieler ${input.player.id} ist bereits in der Lobby.`);
  }

  if (state.players.length >= state.config.maxPlayers) {
    throw new Error("Die Lobby ist bereits voll.");
  }

  return touchState({
    ...state,
    players: [
      ...state.players,
      createPlayerState({
        id: input.player.id,
        name: input.player.name,
        role: "investigator",
        isHost: false
      })
    ],
    publicLog: [
      ...state.publicLog,
      {
        round: 0,
        message: `${input.player.name} ist der Lobby beigetreten.`
      }
    ]
  });
}

export function startMatch(
  state: MatchState,
  input: StartMatchInput
): MatchState {
  requireLobbyStage(state);

  if (state.players.length < state.config.minPlayers) {
    throw new Error("Es sind noch nicht genug Spieler in der Lobby.");
  }

  if (!state.players.some((player) => player.id === input.mrXPlayerId)) {
    throw new Error("Mr. X muss ein Spieler aus der Lobby sein.");
  }

  return touchState({
    ...state,
    stage: "planning",
    round: 1,
    players: state.players.map((player) =>
      createPlayerState({
        id: player.id,
        name: player.name,
        role: player.id === input.mrXPlayerId ? "mr_x" : "investigator",
        isHost: player.isHost,
        nodeId: input.startPositions[player.id] ?? DEFAULT_START_NODE
      })
    ),
    publicLog: [
      ...state.publicLog,
      {
        round: 1,
        message: "Das Match hat begonnen."
      }
    ]
  });
}

export function markPlayerReady(
  state: MatchState,
  playerId: string
): MatchState {
  requirePlayer(state, playerId);

  return touchState({
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, ready: true } : player
    )
  });
}

export function submitPlayerMove(
  state: MatchState,
  input: SubmitMoveInput
): MatchState {
  requirePlanningStage(state);

  const player = requirePlayer(state, input.playerId);

  if (player.eliminated) {
    throw new Error("Eliminierte Spieler können keine Züge mehr planen.");
  }

  if (player.tickets[input.ticket] <= 0) {
    throw new Error("Für diesen Zug ist kein Ticket mehr verfügbar.");
  }

  return touchState({
    ...state,
    players: state.players.map((entry) =>
      entry.id === input.playerId
        ? {
            ...entry,
            ready: false,
            plannedMove: {
              type: "move",
              round: state.round,
              fromNodeId: entry.nodeId,
              toNodeId: input.toNodeId,
              ticket: input.ticket
            }
          }
        : entry
    )
  });
}

export function listActivePlayers(state: MatchState): PlayerState[] {
  return state.players.filter((player) => !player.eliminated);
}

export function allActivePlayersReady(state: MatchState): boolean {
  return listActivePlayers(state).every((player) => player.ready);
}

export function allActivePlayersHaveMoves(state: MatchState): boolean {
  return listActivePlayers(state).every((player) => player.plannedMove !== null);
}

export function shouldRevealMrXPosition(state: MatchState, round: number): boolean {
  return state.config.revealRounds.includes(round);
}
