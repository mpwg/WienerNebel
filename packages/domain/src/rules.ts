import type {
  MatchStage,
  MatchState,
  PlannedMove,
  PlayerState,
  TicketType
} from "./model";
import {
  allActivePlayersHaveMoves,
  allActivePlayersReady,
  listActivePlayers,
  shouldRevealMrXPosition
} from "./model";

export interface StageTransition {
  from: MatchStage;
  to: MatchStage;
  reason: string;
}

export interface ResolutionReadiness {
  canResolve: boolean;
  missingMoves: string[];
  notReady: string[];
}

export interface PlayerMoveVisibility {
  publicTicket: Exclude<TicketType, "black"> | "hidden";
  revealDestination: boolean;
}

export const MATCH_STAGE_TRANSITIONS: StageTransition[] = [
  { from: "lobby", to: "planning", reason: "Match gestartet" },
  { from: "planning", to: "resolving", reason: "Alle Züge liegen vor" },
  { from: "resolving", to: "planning", reason: "Nächste Runde beginnt" },
  { from: "resolving", to: "meeting", reason: "Meeting ausgelöst" },
  { from: "meeting", to: "planning", reason: "Meeting beendet" },
  { from: "planning", to: "finished", reason: "Siegbedingung erfüllt" },
  { from: "resolving", to: "finished", reason: "Siegbedingung erfüllt" },
  { from: "meeting", to: "finished", reason: "Siegbedingung erfüllt" }
];

export function getResolutionReadiness(state: MatchState): ResolutionReadiness {
  const activePlayers = listActivePlayers(state);

  return {
    canResolve: allActivePlayersHaveMoves(state) && allActivePlayersReady(state),
    missingMoves: activePlayers
      .filter((player) => player.plannedMove === null)
      .map((player) => player.id),
    notReady: activePlayers.filter((player) => !player.ready).map((player) => player.id)
  };
}

export function getVisibleMoveTicket(
  player: PlayerState,
  move: PlannedMove
): PlayerMoveVisibility {
  if (player.role === "mr_x" && move.ticket === "black") {
    return {
      publicTicket: "hidden",
      revealDestination: false
    };
  }

  return {
    publicTicket: move.ticket === "black" ? "hidden" : move.ticket,
    revealDestination: player.role !== "mr_x"
  };
}

export function canStartMatch(state: MatchState): boolean {
  return state.stage === "lobby" && state.players.length >= state.config.minPlayers;
}

export function isRoundReadyToResolve(state: MatchState): boolean {
  return state.stage === "planning" && getResolutionReadiness(state).canResolve;
}

export function shouldEndMatch(state: MatchState): boolean {
  const mrX = state.players.find((player) => player.role === "mr_x");
  const investigators = state.players.filter((player) => player.role === "investigator");

  if (!mrX) {
    return false;
  }

  const caught = investigators.some((player) => player.nodeId === mrX.nodeId);

  if (caught) {
    return true;
  }

  return state.round >= state.config.maxRounds;
}

export function getRoundVisibility(state: MatchState): {
  round: number;
  revealMrXPosition: boolean;
} {
  return {
    round: state.round,
    revealMrXPosition: shouldRevealMrXPosition(state, state.round)
  };
}
