import type { MatchState, PlayerState, TicketType } from "./model";

export interface PublicPlayerView {
  id: string;
  name: string;
  ready: boolean;
}

export interface PublicMatchView {
  id: string;
  mapId: string;
  stage: MatchState["stage"];
  round: number;
  maxRounds: number;
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

export function createPublicMatchView(state: MatchState): PublicMatchView {
  return {
    id: state.id,
    mapId: state.mapId,
    stage: state.stage,
    round: state.round,
    maxRounds: state.maxRounds,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      ready: player.ready
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
