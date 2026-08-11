import { z } from "zod";
import { LogType } from "./models.ts";

export const ChatPayloadSchema = z.object({
  text: z.string().min(1).max(300),
});

export const SystemPayloadSchema = z.object({
  message: z.string(),
  event: z.enum(["join", "leave", "disconnect", "reconnect", "timeout", "game_over"]),
});

export const ActionPayloadSchema = z.object({
  // e.g. "build_road", "move_piece", "roll_dice"
  actionId: z.string(),
  // e.g. { x: 2, y: 4, type: "road" }
  data: z.record(z.string(), z.unknown()).optional(),
});

export const TradePayloadSchema = z.object({
  targetPlayerId: z.number().nullable().optional(),
  status: z.enum(["proposed", "accepted", "rejected", "withdrawn"]),
  offered: z.record(z.string(), z.number()),
  requested: z.record(z.string(), z.number()),
});


export const MatchLogSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(LogType.CHAT), payload: ChatPayloadSchema }),
  z.object({ type: z.literal(LogType.SYSTEM), payload: SystemPayloadSchema }),
  z.object({ type: z.literal(LogType.ACTION), payload: ActionPayloadSchema }),
  z.object({ type: z.literal(LogType.TRADE), payload: TradePayloadSchema }),
]);

export type MatchLogEvent = z.infer<typeof MatchLogSchema>;
export type SystemPayload = z.infer<typeof SystemPayloadSchema>;
export type ChatPayload = z.infer<typeof ChatPayloadSchema>;
export type ActionPayload = z.infer<typeof ActionPayloadSchema>;
export type TradePayload = z.infer<typeof TradePayloadSchema>;