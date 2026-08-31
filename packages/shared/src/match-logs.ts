import { z } from "zod";
import { LogType } from "./models.ts";
import { CHAT_MAX_LENGTH } from "./constants.ts";

export const ChatPayloadSchema = z.object({
  userId: z.number(),
  name: z.string(),
  text: z.string().min(1).max(CHAT_MAX_LENGTH),
});

export const SystemPayloadSchema = z.object({
  message: z.string(),
  event: z.enum(["join", "leave", "disconnect", "reconnect", "timeout", "game_over"]),
});

export const ActionPayloadSchema = z.object({
  // e.g. "build_road", "roll"
  actionId: z.string(),
  // e.g. { q: 2, r: 4, type: "road" }
  data: z.record(z.string(), z.unknown()).optional(),
});

export const TradePayloadSchema = z.object({
  targetPlayerId: z.number().nullable().optional(),
  status: z.enum(["proposed", "accepted", "rejected", "withdrawn"]),
  offered: z.record(z.string(), z.number()),
  requested: z.record(z.string(), z.number()),
});


export const MatchLogBaseSchema = z.object({
  id: z.number(),
  matchId: z.number(),
  createdAt: z.date(),
});

export const MatchLogPayloadSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(LogType.CHAT), payload: ChatPayloadSchema }),
  z.object({ type: z.literal(LogType.SYSTEM), payload: SystemPayloadSchema }),
  z.object({ type: z.literal(LogType.ACTION), payload: ActionPayloadSchema }),
  z.object({ type: z.literal(LogType.TRADE), payload: TradePayloadSchema }),
]);

export const MatchLogSchema = MatchLogBaseSchema.and(MatchLogPayloadSchema);

export type LogEventData = z.infer<typeof MatchLogPayloadSchema>;
export type MatchLogEvent = z.infer<typeof MatchLogSchema>;

export type SystemPayload = z.infer<typeof SystemPayloadSchema>;
export type ChatPayload = z.infer<typeof ChatPayloadSchema>;
export type ActionPayload = z.infer<typeof ActionPayloadSchema>;
export type TradePayload = z.infer<typeof TradePayloadSchema>;