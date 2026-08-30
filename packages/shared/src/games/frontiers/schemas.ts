import { z } from "zod";

export const FrontiersBuildActionSchema = z.object({
  kind: z.literal("build"),
  data: z.object({
    item: z.enum(["road", "settlement", "city"]),
    q: z.number(),
    r: z.number(),
    s: z.number(),
  }),
});

export const FrontiersRollActionSchema = z.object({
  kind: z.literal("roll"),
  // data: z.object({}).optional(), // TODO: alchemist choosing dice roll
});

export const FrontiersActionSchema = z.discriminatedUnion("kind", [
  FrontiersBuildActionSchema,
  FrontiersRollActionSchema,
  // TODO: trade, move robber, etc.
]);

export type FrontiersMove = z.infer<typeof FrontiersActionSchema>;