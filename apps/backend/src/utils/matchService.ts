import { LogType, match, matchLog, MatchLogSchema, matchPlayer, MatchStatus, user } from "@board-bot-arena/shared";
import { db } from "../db/index.ts";
import { and, count, eq, isNull, ne, sql } from "drizzle-orm";

export const handlePlayerRemoval = async (matchId: number, userId: number, io: any) => {
  return await db.transaction(async (tx) => {
    const [dbMatch] = await tx.select().from(match).where(eq(match.id, matchId));
    if (!dbMatch) return null;

    const [dbMatchPlayer] = await tx.select().from(matchPlayer).where(and(
      eq(matchPlayer.userId, userId),
      eq(matchPlayer.matchId, matchId),
    ));
    if (!dbMatchPlayer) return null;

    let newHostId = null;
    if (dbMatchPlayer.isHost) {
      const [newHost] = await tx
        .select()
        .from(matchPlayer)
        .where(
          and(
            eq(matchPlayer.matchId, matchId),
            ne(matchPlayer.userId, userId),
            isNull(matchPlayer.botId), // bots cannot be hosts
          )
        )
        .limit(1);
      
      if (newHost) {
        await tx.update(matchPlayer).set({ isHost: true }).where(eq( matchPlayer.id, newHost.id ));
        newHostId = newHost.id;
      } else if (dbMatch.status === MatchStatus.PENDING) {
        // Delete the whole match because its only bots in a lobby
        // It should cascade to matchPlayers and matchLog
        await tx.delete(match).where(eq(match.id, matchId));
        return;
      }
    }

    if (dbMatch.status === MatchStatus.PENDING) {
      await tx.delete(matchPlayer).where(and(
        eq(matchPlayer.id, dbMatchPlayer.id),
      ));

      await tx.update(match).set({ numPlayers: sql`${match.numPlayers} - 1` }).where(eq(match.id, matchId));
    } else {
      await tx.update(matchPlayer).set({ abandoned: true }).where(and(
        eq(matchPlayer.id, dbMatchPlayer.id),
      ));
    }

    const [activePlayers] = await tx
      .select({ count: count() })
      .from(matchPlayer)
      .where(and(
        eq(matchPlayer.matchId, matchId),
        eq(matchPlayer.abandoned, false)
      ));

    if (!activePlayers || activePlayers.count <= 0) {
      await tx.update(match).set({ status: MatchStatus.ABORTED }).where(eq(match.id, matchId));
    }

    const [dbUser] = await tx.select({ name: user.name }).from(user).where(eq(user.id, userId));
    if (!dbUser) throw new Error("Could not find user");

    const [newLog] = await tx.insert(matchLog).values({
      matchId,
      type: LogType.SYSTEM,
      payload: {
        message: `${dbMatchPlayer.name ?? dbUser.name} left the match.`,
        event: "leave",
      },
    }).returning();
    if (!newLog) throw new Error("Could not insert newLog");

    const validatedLog = MatchLogSchema.parse(newLog);
    io.to(`match_${matchId}`).emit('player_left', { playerId: dbMatchPlayer.id, newHostId });
    io.to(`match_${matchId}`).emit('new_match_log', { log: validatedLog });

    return { playerId: dbMatchPlayer.id, newHostId };
  });
};