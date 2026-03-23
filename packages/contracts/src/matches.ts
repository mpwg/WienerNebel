import { z } from "zod";

const ticketTypeSchema = z.enum(["walk", "subway", "tram", "bus", "black"]);

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

export type MoveChoice = z.infer<typeof moveChoiceSchema>;
export type SubmitMoveRequest = z.infer<typeof submitMoveSchema>;
export type ReadyRequest = z.infer<typeof readySchema>;
export type MeetingRequest = z.infer<typeof meetingSchema>;
export type VoteRequest = z.infer<typeof voteSchema>;
