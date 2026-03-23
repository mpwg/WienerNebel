import { z } from "zod";
import { publicMatchViewSchema } from "./common";

export const guestLoginSchema = z.object({
  name: z.string().trim().min(2).max(24)
});

export const createLobbySchema = z.object({
  hostId: z.string().min(1),
  hostName: z.string().trim().min(2).max(24),
  mapId: z.string().default("vienna_core"),
  minPlayers: z.number().int().min(3).max(6).default(3),
  maxPlayers: z.number().int().min(3).max(6).default(6),
  maxRounds: z.number().int().min(10).max(30).default(20)
}).refine((value) => value.minPlayers <= value.maxPlayers, {
  message: "minPlayers darf nicht größer als maxPlayers sein.",
  path: ["minPlayers"]
});

export const joinLobbySchema = z.object({
  matchId: z.string().min(1),
  joinCode: z.string().trim().length(6),
  playerId: z.string().min(1),
  playerName: z.string().trim().min(2).max(24)
});

export const guestLoginResponseSchema = z.object({
  playerId: z.string().min(1),
  name: z.string().trim().min(2).max(24)
});

export const createLobbyResponseSchema = z.object({
  matchId: z.string().min(1),
  lobby: publicMatchViewSchema
});

export const joinLobbyResponseSchema = z.object({
  lobby: publicMatchViewSchema
});

export type GuestLoginRequest = z.infer<typeof guestLoginSchema>;
export type CreateLobbyRequest = z.infer<typeof createLobbySchema>;
export type JoinLobbyRequest = z.infer<typeof joinLobbySchema>;
export type GuestLoginResponse = z.infer<typeof guestLoginResponseSchema>;
export type CreateLobbyResponse = z.infer<typeof createLobbyResponseSchema>;
export type JoinLobbyResponse = z.infer<typeof joinLobbyResponseSchema>;
