import { z } from "zod";

export const matchStageSchema = z.enum([
  "lobby",
  "planning",
  "resolving",
  "meeting",
  "finished"
]);

export const playerRoleSchema = z.enum(["mr_x", "investigator"]);

export const ticketTypeSchema = z.enum(["walk", "subway", "tram", "bus", "black"]);

export const publicLogEntrySchema = z.object({
  round: z.number().int().min(0),
  message: z.string().min(1)
});

export const publicPlayerViewSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(24),
  ready: z.boolean(),
  connected: z.boolean(),
  eliminated: z.boolean(),
  isHost: z.boolean()
});

export const publicMatchViewSchema = z.object({
  id: z.string().min(1),
  joinCode: z.string().trim().length(6),
  mapId: z.string().min(1),
  stage: matchStageSchema,
  round: z.number().int().min(0),
  maxRounds: z.number().int().min(1),
  revealMrXPosition: z.boolean(),
  players: z.array(publicPlayerViewSchema),
  publicLog: z.array(publicLogEntrySchema)
});

export const playerPrivateViewSchema = z.object({
  id: z.string().min(1),
  role: playerRoleSchema,
  nodeId: z.string().min(1),
  tickets: z.record(ticketTypeSchema, z.number().int().min(0))
});

export const playerMatchViewSchema = publicMatchViewSchema.extend({
  self: playerPrivateViewSchema
});

export const apiErrorSchema = z.object({
  error: z.string().min(1)
});

export type MatchStage = z.infer<typeof matchStageSchema>;
export type PlayerRole = z.infer<typeof playerRoleSchema>;
export type TicketType = z.infer<typeof ticketTypeSchema>;
export type PublicLogEntryDto = z.infer<typeof publicLogEntrySchema>;
export type PublicPlayerViewDto = z.infer<typeof publicPlayerViewSchema>;
export type PublicMatchViewDto = z.infer<typeof publicMatchViewSchema>;
export type PlayerPrivateViewDto = z.infer<typeof playerPrivateViewSchema>;
export type PlayerMatchViewDto = z.infer<typeof playerMatchViewSchema>;
export type ApiErrorDto = z.infer<typeof apiErrorSchema>;
