import type { MatchState, PlannedMove, PlayerState, TicketType } from "./model";
import { getVisibleMoveTicket, getRoundVisibility } from "./rules";

export interface PublicPlayerView {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
  eliminated: boolean;
  isHost: boolean;
}

export interface PublicMatchView {
  id: string;
  joinCode: string;
  mapId: string;
  stage: MatchState["stage"];
  round: number;
  maxRounds: number;
  revealMrXPosition: boolean;
  players: PublicPlayerView[];
  publicLog: MatchState["publicLog"];
}

export interface PlayerPrivateView {
  id: string;
  role: PlayerState["role"];
  nodeId: string;
  tickets: Record<TicketType, number>;
}

export interface PlayerMatchView extends PublicMatchView {
  self: PlayerPrivateView;
}

export interface InternalPlayerView extends PlayerState {}

export interface InternalMatchView extends PublicMatchView {
  config: MatchState["config"];
  winner: MatchState["winner"];
  roundHistory: MatchState["roundHistory"];
  players: InternalPlayerView[];
}

export interface PublicRoundMoveView {
  playerId: string;
  ticket: Exclude<TicketType, "black"> | "hidden";
  toNodeId: string | null;
}

export function createPublicRoundMoveView(
  player: PlayerState,
  move: PlannedMove
): PublicRoundMoveView {
  const visibility = getVisibleMoveTicket(player, move);

  return {
    playerId: player.id,
    ticket: visibility.publicTicket,
    toNodeId: visibility.revealDestination ? move.toNodeId : null
  };
}

export function createPublicMatchView(state: MatchState): PublicMatchView {
  const visibility = getRoundVisibility(state);

  return {
    id: state.id,
    joinCode: state.joinCode,
    mapId: state.mapId,
    stage: state.stage,
    round: state.round,
    maxRounds: state.config.maxRounds,
    revealMrXPosition: visibility.revealMrXPosition,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      ready: player.ready,
      connected: player.connected,
      eliminated: player.eliminated,
      isHost: player.isHost
    })),
    publicLog: state.publicLog
  };
}

export function createPlayerMatchView(
  state: MatchState,
  playerId: string
): PlayerMatchView | null {
  const player = state.players.find((entry) => entry.id === playerId);

  if (!player) {
    return null;
  }

  return {
    ...createPublicMatchView(state),
    self: {
      id: player.id,
      role: player.role,
      nodeId: player.nodeId,
      tickets: player.tickets
    }
  };
}

export function createInternalMatchView(state: MatchState): InternalMatchView {
  return {
    ...createPublicMatchView(state),
    config: state.config,
    winner: state.winner,
    roundHistory: state.roundHistory,
    players: state.players
  };
}
