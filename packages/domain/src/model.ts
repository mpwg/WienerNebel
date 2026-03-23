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
  playerId: string;
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
  requestedByPlayerId: string;
  mrXPlayerId: string;
  startPositions: Record<string, NodeId>;
}

export interface SubmitMoveInput {
  playerId: string;
  toNodeId: NodeId;
  ticket: TicketType;
}

export interface MeetingInput {
  playerId: string;
  reason: string;
}

export interface VoteInput {
  playerId: string;
  suspectPlayerId: string;
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

function requireMeetingStage(state: MatchState): void {
  if (state.stage !== "meeting") {
    throw new Error("Abstimmungen sind nur während eines Meetings möglich.");
  }
}

function requirePlayer(state: MatchState, playerId: string): PlayerState {
  const player = state.players.find((entry) => entry.id === playerId);

  if (!player) {
    throw new Error(`Spieler ${playerId} existiert nicht.`);
  }

  return player;
}

function requireHost(state: MatchState, playerId: string): void {
  const player = requirePlayer(state, playerId);

  if (!player.isHost) {
    throw new Error("Nur der Host darf diese Aktion ausführen.");
  }
}

function createRoundLogMessage(
  state: MatchState,
  player: PlayerState,
  move: PlannedMove
): string {
  const revealMrXPosition = shouldRevealMrXPosition(state, move.round);

  if (player.role === "mr_x") {
    if (move.ticket === "black") {
      return revealMrXPosition
        ? `Mr. X hat ein Black Ticket verwendet und wurde bei ${move.toNodeId} gesichtet.`
        : "Mr. X hat ein Black Ticket verwendet.";
    }

    return revealMrXPosition
      ? `Mr. X nutzte ${move.ticket} und wurde bei ${move.toNodeId} gesichtet.`
      : `Mr. X nutzte ${move.ticket}.`;
  }

  return `${player.name} bewegte sich mit ${move.ticket} nach ${move.toNodeId}.`;
}

function decrementTicket(
  tickets: Record<TicketType, number>,
  ticket: TicketType
): Record<TicketType, number> {
  return {
    ...tickets,
    [ticket]: tickets[ticket] - 1
  };
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
  requireHost(state, input.requestedByPlayerId);

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
              playerId: entry.id,
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

export function resolvePlannedRound(state: MatchState): MatchState {
  requirePlanningStage(state);

  const activePlayers = listActivePlayers(state);

  if (!activePlayers.every((player) => player.ready)) {
    throw new Error("Noch nicht alle aktiven Spieler sind bereit.");
  }

  if (!activePlayers.every((player) => player.plannedMove !== null)) {
    throw new Error("Noch nicht alle aktiven Spieler haben einen Zug abgegeben.");
  }

  const moves = activePlayers
    .map((player) => player.plannedMove)
    .filter((move): move is PlannedMove => move !== null);
  const revealMrXPosition = shouldRevealMrXPosition(state, state.round);
  const updatedPlayers = state.players.map((player) => {
    if (player.eliminated || !player.plannedMove) {
      return {
        ...player,
        ready: false
      };
    }

    return {
      ...player,
      nodeId: player.plannedMove.toNodeId,
      ready: false,
      tickets: decrementTicket(player.tickets, player.plannedMove.ticket),
      plannedMove: null
    };
  });
  const mrX = updatedPlayers.find((player) => player.role === "mr_x");
  const investigators = updatedPlayers.filter(
    (player) => player.role === "investigator" && !player.eliminated
  );
  const investigatorsWin =
    mrX !== undefined &&
    investigators.some((player) => player.nodeId === mrX.nodeId);
  const mrXWins = !investigatorsWin && state.round >= state.config.maxRounds;

  return touchState({
    ...state,
    stage: investigatorsWin || mrXWins ? "finished" : "planning",
    round: investigatorsWin || mrXWins ? state.round : state.round + 1,
    players: updatedPlayers,
    publicLog: [
      ...state.publicLog,
      ...moves.map((move) => ({
        round: move.round,
        message: createRoundLogMessage(
          state,
          activePlayers.find((entry) => entry.id === move.playerId) ??
            requirePlayer(state, move.playerId),
          move
        )
      })),
      ...(revealMrXPosition && mrX
        ? [
            {
              round: state.round,
              message: `Reveal: Mr. X befindet sich bei ${mrX.nodeId}.`
            }
          ]
        : []),
      ...(investigatorsWin
        ? [
            {
              round: state.round,
              message: "Die Ermittler haben Mr. X gefasst."
            }
          ]
        : []),
      ...(mrXWins
        ? [
            {
              round: state.round,
              message: "Mr. X hat das Match überlebt und gewinnt."
            }
          ]
        : [])
    ],
    roundHistory: [
      ...state.roundHistory,
      {
        round: state.round,
        moves,
        revealMrXPosition
      }
    ],
    winner: investigatorsWin ? "investigators" : mrXWins ? "mr_x" : null
  });
}

export function startMeeting(state: MatchState, input: MeetingInput): MatchState {
  const player = requirePlayer(state, input.playerId);

  if (state.stage === "finished") {
    throw new Error("Ein beendetes Match kann kein Meeting mehr starten.");
  }

  if (state.stage === "lobby") {
    throw new Error("Vor Match-Start kann kein Meeting gestartet werden.");
  }

  return touchState({
    ...state,
    stage: "meeting",
    publicLog: [
      ...state.publicLog,
      {
        round: state.round,
        message: `${player.name} hat ein Meeting gestartet: ${input.reason}`
      }
    ]
  });
}

export function castVote(state: MatchState, input: VoteInput): MatchState {
  requireMeetingStage(state);

  const voter = requirePlayer(state, input.playerId);
  const suspect = requirePlayer(state, input.suspectPlayerId);

  return touchState({
    ...state,
    stage: state.winner ? "finished" : "planning",
    publicLog: [
      ...state.publicLog,
      {
        round: state.round,
        message: `${voter.name} verdächtigt ${suspect.name}.`
      },
      {
        round: state.round,
        message: "Das Meeting wurde ohne Eliminierung beendet."
      }
    ]
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
