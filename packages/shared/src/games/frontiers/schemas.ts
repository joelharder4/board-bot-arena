import { z } from "zod";

export const FrontiersBuildActionSchema = z.object({
  actionId: z.literal("build"),
  data: z.object({
    item: z.enum(["road", "settlement", "city"]),
    q: z.number(),
    r: z.number(),
    s: z.number(),
  }),
});

export const FrontiersRollActionSchema = z.object({
  actionId: z.literal("roll"),
  data: z.object({}).optional(),
});

export const FrontiersActionSchema = z.discriminatedUnion("actionId", [
  FrontiersBuildActionSchema,
  FrontiersRollActionSchema,
  // TODO: trade, move robber, etc.
]);

export type FrontiersMove = z.infer<typeof FrontiersActionSchema>;