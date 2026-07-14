import { pgTable, pgEnum, serial, text, timestamp, integer, varchar, boolean, check, char, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { MatchStatus, UserRole } from './models.ts';

export const rolesEnum = pgEnum(
  "roles",
  Object.values(UserRole) as [string, ...string[]]
);
export const matchStatusEnum = pgEnum(
  "match_status",
  Object.values(MatchStatus) as [string, ...string[]]
);

const timestamps = {
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
};


export const user = pgTable("user", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().unique(),
  role: rolesEnum().default("user").notNull(),
  passwordHash: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: serial().primaryKey(),
  userId: integer("user_id").references(() => user.id),
  refreshToken: text(),
});

// e.g. 1, "Catan", "Strategy", 2, 4
export const game = pgTable("game", {
  id: serial().primaryKey(),
  name: text().unique().notNull(),
  genre: text(), // could be turned into a different table
  minPlayers: integer("min_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull(),
});

export const bot = pgTable("bot", {
  id: serial().primaryKey(),
  ownerId: integer("owner_id").references(() => user.id),
  name: varchar({ length: 128 }),
});

export const match = pgTable("match", {
  id: serial().primaryKey(),
  gameId: integer("game_id").references(() => game.id).notNull(),
  botsOnly: boolean("bots_only").default(false).notNull(),
  numPlayers: integer("num_players").default(0).notNull(),
  status: matchStatusEnum().default("pending").notNull(),
  joinCode: varchar({ length: 6 }),
  ...timestamps,
});

export const matchPlayer = pgTable("match_player", {
  id: serial().primaryKey(),
  matchId: integer("match_id").references(() => match.id).notNull(),
  
  botId: integer("bot_id").references(() => bot.id),
  userId: integer("user_id").references(() => user.id),
  
  name: text(),
  colour: char({ length: 7 }).default("#000000").notNull(), 
  teamIndex: integer("team_index"), // Optional: tells you who is allied
  score: integer().default(0),
  state: jsonb().default({}),
  isWinner: boolean("is_winner").default(false).notNull(),
}, (table) => [
  check(
    "participant_type_check",
    sql`(${table.botId} IS NOT NULL AND ${table.userId} IS NULL) OR (${table.botId} IS NULL AND ${table.userId} IS NOT NULL)`
  ),
]);