import { z } from "zod";
import {
  playerMatchViewSchema,
  publicMatchViewSchema,
  ticketTypeSchema
} from "./common";

export const moveChoiceSchema = z.object({
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  ticket: ticketTypeSchema
});

export const submitMoveSchema = z.object({
  playerId: z.string().min(1),
  move: moveChoiceSchema
});

export const readySchema = z.object({
  playerId: z.string().min(1)
});

export const meetingSchema = z.object({
  playerId: z.string().min(1),
  reason: z.string().trim().min(2).max(200)
});

export const voteSchema = z.object({
  playerId: z.string().min(1),
  suspectPlayerId: z.string().min(1)
});

export const getMatchStateParamsSchema = z.object({
  matchId: z.string().min(1)
});

export const getPlayerMatchStateQuerySchema = z.object({
  playerId: z.string().min(1)
});

export const publicMatchStateResponseSchema = z.object({
  match: publicMatchViewSchema
});

export const playerMatchStateResponseSchema = z.object({
  match: playerMatchViewSchema
});

export type MoveChoice = z.infer<typeof moveChoiceSchema>;
export type SubmitMoveRequest = z.infer<typeof submitMoveSchema>;
export type ReadyRequest = z.infer<typeof readySchema>;
export type MeetingRequest = z.infer<typeof meetingSchema>;
export type VoteRequest = z.infer<typeof voteSchema>;
export type GetMatchStateParams = z.infer<typeof getMatchStateParamsSchema>;
export type GetPlayerMatchStateQuery = z.infer<typeof getPlayerMatchStateQuerySchema>;
export type PublicMatchStateResponse = z.infer<typeof publicMatchStateResponseSchema>;
export type PlayerMatchStateResponse = z.infer<typeof playerMatchStateResponseSchema>;
