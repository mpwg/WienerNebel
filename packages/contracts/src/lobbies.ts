import { z } from "zod";

export const guestLoginSchema = z.object({
  name: z.string().trim().min(2).max(24)
});

export const createLobbySchema = z.object({
  hostId: z.string().min(1),
  hostName: z.string().trim().min(2).max(24),
  mapId: z.string().default("vienna_core"),
  maxRounds: z.number().int().min(10).max(30).default(20)
});

export const joinLobbySchema = z.object({
  matchId: z.string().min(1),
  playerId: z.string().min(1),
  playerName: z.string().trim().min(2).max(24)
});

export type GuestLoginRequest = z.infer<typeof guestLoginSchema>;
export type CreateLobbyRequest = z.infer<typeof createLobbySchema>;
export type JoinLobbyRequest = z.infer<typeof joinLobbySchema>;
