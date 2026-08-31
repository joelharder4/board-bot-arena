import { z } from "zod";
import { Resource } from "./types.ts";

export const FrontiersBuildActionSchema = z.object({
  actionId: z.literal("build"),
  data: z.object({
    item: z.enum(["road", "settlement", "city"]),
    q: z.number(),
    r: z.number(),
    s: z.number(),
  }),
});

export const FrontiersRollRequestSchema = z.object({
  actionId: z.literal("roll"),
});

export const FrontiersActionSchema = z.discriminatedUnion("actionId", [
  FrontiersBuildActionSchema,
  FrontiersRollRequestSchema,
  // TODO: trade, move robber, etc.
]);

export type FrontiersMove = z.infer<typeof FrontiersActionSchema>;

export const FrontiersRollLogSchema = z.object({
  actionId: z.literal("roll"),
  data: z.object({
    die1: z.number(),
    die2: z.number(),
    total: z.number()
  })
});

export const FrontiersPickupLogSchema = z.object({
  actionId: z.literal("pickup"),
  data: z.object({
    playerId: z.number(),
    resources: z.record(
      z.enum(Resource),
      z.number()
    ),
  })
});