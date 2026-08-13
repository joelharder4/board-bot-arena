import express, { type Request, type Response } from 'express';
import { game, LogType, match, matchLog, MatchLogSchema, matchPlayer, MatchStatus, TEAM_MAP, user, UserRole, type ApiErrorResponse, type CreateMatchRequest, type CreateMatchResponse, type JoinMatchRequest, type JoinMatchResponse, type LeaveMatchRequest, type LeaveMatchResponse, type LobbyPlayer, type Match, type MatchDetailsParams, type MatchDetailsResponse, type MatchListParams, type MatchListResponse, type MatchLogEvent, type NewMatchLogPayload, type PlayerLeftPayload } from '@board-bot-arena/shared';
import { db } from '../db/index.ts';
import { and, count, eq, inArray, isNull, ne, sql, SQL } from 'drizzle-orm';
import { generateJoinCode } from '../utils/genCodes.ts';
import { ApiError } from '../utils/errors.ts';
import { requireAuth, requireRoles } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', async (
    req: Request<{}, any, any, MatchListParams>,
    res: Response<MatchListResponse | ApiErrorResponse>,
) => {
  try {
    const { gameId, userId, botId, status, count } = req.query;
    
    const limit = count ? count > 50 ? 50 : count : 3; // max 50
    const whereClauses: SQL[] = [];

    if (gameId) whereClauses.push( eq(game.id, gameId) );
    if (status) whereClauses.push( eq(match.status, status) );

    if (userId) {
      whereClauses.push(
        inArray(
          match.id,
          db.select({ matchId: matchPlayer.matchId })
            .from(matchPlayer)
            .where(eq(matchPlayer.userId, userId))
        )
      );
    }
    
    if (botId) {
      whereClauses.push(
        inArray(
          match.id,
          db.select({ matchId: matchPlayer.matchId })
            .from(matchPlayer)
            .where(eq(matchPlayer.botId, botId))
        )
      );
    }
    
    const dbMatches = await db
      .select()
      .from(match)
      .innerJoin(game, eq(game.id, match.gameId))
      .where( and(...whereClauses) )
      .limit(limit)
    
    const payload: MatchListResponse = dbMatches.map((m) => ({
      matchId: m.match.id,
      gameId: m.game.id,
      gameTitle: m.game.name,
      numPlayers: m.match.numPlayers,
      maxPlayers: m.game.maxPlayers,
      status: m.match.status as MatchStatus,
      createdAt: m.match.createdAt,
    }));

    res.json(payload);

  } catch(e) {
    console.error("Creating lobby error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.use(requireAuth);


router.get('/:matchId', async (
    req: Request<MatchDetailsParams>,
    res: Response<MatchDetailsResponse | ApiErrorResponse>,
) => {
  try {
    const matchId = parseInt(req.params.matchId as unknown as string, 10);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: "Invalid matchId format." });
    }
    
    const [dbMatch] = await db
      .select()
      .from(match)
      .innerJoin(game, eq(game.id, match.gameId))
      .where(eq(match.id, matchId));
    if (!dbMatch) return res.status(404).json({ error: "Could not find match" });
    
    const gameMatch: Match = {
      matchId,
      gameId: dbMatch.game.id,
      joinCode: dbMatch.match.joinCode,
      gameTitle: dbMatch.game.name,
      numPlayers: dbMatch.match.numPlayers,
      maxPlayers: dbMatch.game.maxPlayers,
      status: dbMatch.match.status as MatchStatus,
      createdAt: dbMatch.match.createdAt
    }

    const dbPlayers = await db
      .select()
      .from(matchPlayer)
      .innerJoin(user, eq(user.id, matchPlayer.userId))
      .where(eq(matchPlayer.matchId, matchId));
    
    const players: LobbyPlayer[] = dbPlayers.map((p) => ({
      type: "user",
      userId: p.user.id,
      playerId: p.match_player.id,
      name: p.match_player.name ?? p.user.name,
      colour: p.match_player.colour,
      teamId: p.match_player.teamIndex,
      isHost: p.match_player.isHost,
    }));

    const dbLog = await db
      .select()
      .from(matchLog)
      .where(eq(matchLog.matchId, matchId));
    
    const log: MatchLogEvent[] = dbLog.map((l) => MatchLogSchema.parse(l));

    res.json({ match: gameMatch, players, log });
  } catch (e) {
    console.error("Creating lobby error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/join', async (
    req: Request<{}, any, JoinMatchRequest>,
    res: Response<JoinMatchResponse | ApiErrorResponse>,
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.userId;

    const { matchId, joinCode } = req.body;

    let dbMatch;
    let whereClause: SQL;

    if (matchId) {
      whereClause = eq(match.id, matchId);
    } else if (joinCode) {
      whereClause = eq(match.joinCode, joinCode);
    } else {
      return res.status(400).json({ error: "did not provide a match id or join code" });
    }

    [dbMatch] = await db.select().from(match).leftJoin(game, eq(game.id, match.gameId)).where(whereClause);
    if (!dbMatch || !dbMatch.game || !dbMatch.match) return res.status(404).json({ error: "Match not found" });
    if (dbMatch?.match.botsOnly) return res.status(401).json({ error: "Lobby is for bots only" });
    if (dbMatch?.match.status == MatchStatus.ABORTED) return res.status(404).json({ error: "Match closed" });
    if (dbMatch?.match.status != MatchStatus.PENDING) return res.status(400).json({ error: "Match started" });
    if (dbMatch.game && dbMatch.match.numPlayers >= dbMatch.game.maxPlayers) return res.status(400).json({ error: "Lobby is full" });
    if (dbMatch.match.deletedAt && dbMatch.match.deletedAt <= new Date(Date.now())) return res.status(404).json({ error: "Match deleted" });

    const player = await db.transaction(async (tx) => {
      // TODO: Add gamerule to allow multiple players on a team
      const existingTeams = await tx
        .select({ team: matchPlayer.teamIndex })
        .from(matchPlayer)
        .where(eq(matchPlayer.matchId, dbMatch.match.id));
      
      const usedTeams = new Set<number>(existingTeams.map((t => t.team)));
      let nextAvailableTeamId = 1;
      while(usedTeams.has(nextAvailableTeamId)) {
        nextAvailableTeamId++;
      }

      const [dbMatchPlayer] = await tx.insert(matchPlayer).values({
        matchId: dbMatch.match.id,
        userId: userId,
        teamIndex: nextAvailableTeamId,
        colour: TEAM_MAP[nextAvailableTeamId]?.hex ?? "#676869",
      }).returning();
      if (!dbMatchPlayer) throw new ApiError(500, "Failed to join match");

      await tx.update(match).set({ numPlayers: sql`${match.numPlayers} + 1` }).where(eq(match.id, dbMatch.match.id));

      const [newLog] = await tx.insert(matchLog).values({
        matchId: dbMatch.match.id,
        type: LogType.SYSTEM,
        payload: {
          message: `${req.user?.name ?? "Unknown"} joined the lobby.`,
          event: "join",
        }
      }).returning();
      if (!newLog) throw new Error("Could not insert newLog");
      
      const validatedLog = MatchLogSchema.parse(newLog);
      const logPayload: NewMatchLogPayload = {
        log: validatedLog,
      }

      const io = req.app.get('io');
      io.to(`match_${matchId}`).emit('new_match_log', logPayload);

      return dbMatchPlayer;
    });

    return res.json({
      matchId: dbMatch.match.id,
      playerId: player.id,
      playerSlot: dbMatch.match.numPlayers + 1,
    });
  } catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.statusCode).json({ error: e.message });
    }

    console.error("Unexpected error in /join: ", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});



router.post('/leave', async (
  req: Request<{}, any, LeaveMatchRequest>,
  res: Response<LeaveMatchResponse | ApiErrorResponse>,
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.userId;
    const { matchId } = req.body;

    const txResult = await db.transaction(async (tx) => {
      const [dbMatch] = await tx
        .select()
        .from(match)
        .where(eq(match.id, matchId));
      if (!dbMatch) throw new ApiError(404, "Match not found");

      const [dbMatchPlayer] = await tx
        .select()
        .from(matchPlayer)
        .where(and(
          eq(matchPlayer.userId, userId),
          eq(matchPlayer.matchId, matchId)
        ));
      if (!dbMatchPlayer) throw new ApiError(404, "Player not found");

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
        
        if (newHost) await tx.update(matchPlayer).set({ isHost: true }).where(eq( matchPlayer.id, newHost.id ));
        else if (dbMatch.status === MatchStatus.PENDING) {
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

      const [newLog] = await tx.insert(matchLog).values({
        matchId,
        type: LogType.SYSTEM,
        payload: {
          message: `${req.user?.name ?? "Unknown"} left the match.`,
          event: "leave"
        }
      }).returning();
      if (!newLog) throw new Error("Could not insert newLog");

      return { playerId: dbMatchPlayer.id, newLog };
    });

    if (!txResult) return res.json({});
    const { playerId, newLog } = txResult;

    const validatedLog = MatchLogSchema.parse(newLog);
    const logPayload: NewMatchLogPayload = { log: validatedLog };
    const leftPayload: PlayerLeftPayload = { playerId };

    const io = req.app.get('io');
    io.to(`match_${matchId}`).emit('player_left', leftPayload);
    io.to(`match_${matchId}`).emit('new_match_log', logPayload);

    res.status(200).json({});
    
  } catch (e) {
    if (e instanceof ApiError) {
      return res.status(e.statusCode).json({ error: e.message });
    }

    console.error("Unexpected error in /leave: ", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.use(requireRoles([UserRole.USER, UserRole.ADMIN]));

router.post('/create', async (
  req: Request<{}, any, CreateMatchRequest>,
  res: Response<CreateMatchResponse | ApiErrorResponse>,
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.userId;
    const joinCode = generateJoinCode();

    await db.transaction(async (tx) => {
      const [dbMatch] = await tx.insert(match).values({
        gameId: req.body.gameId,
        botsOnly: req.body.botsOnly,
        numPlayers: 1,
        joinCode,
      }).returning();
      if (!dbMatch) throw new ApiError(500, "Failed to create match");

      const [dbMatchPlayer] = await tx.insert(matchPlayer).values({
        matchId: dbMatch.id,
        userId,
        teamIndex: 1,
        colour: TEAM_MAP[1]?.hex ?? "#676869",
        isHost: true,
      }).returning();
      if (!dbMatchPlayer) throw new ApiError(500, "Failed to add player to match");

      const [newLog] = await tx.insert(matchLog).values({
        matchId: dbMatch.id,
        type: LogType.SYSTEM,
        payload: {
          message: `${req.user?.name ?? "Unknown"} created the lobby.`,
          event: "join",
        }
      }).returning();
      if (!newLog) throw new ApiError(500, "Failed to create system log");

      return res.json({
        matchId: dbMatch.id,
        playerId: dbMatchPlayer.id,
        joinCode
      });
    });

  } catch(e) {
    if (e instanceof ApiError) {
      return res.status(e.statusCode).json({ error: e.message });
    }

    console.error("Unexpected error in /create: ", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;