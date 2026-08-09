import express, { type Request, type Response } from 'express';
import { game, match, matchPlayer, MatchStatus, TEAM_MAP, user, type ApiErrorResponse, type CreateMatchRequest, type CreateMatchResponse, type JoinMatchRequest, type JoinMatchResponse, type LeaveMatchRequest, type LeaveMatchResponse, type LobbyPlayer, type Match, type MatchDetailsParams, type MatchDetailsResponse, type MatchListParams, type MatchListResponse, type PlayMoveRequest, type PlayMoveResponse } from '@board-bot-arena/shared';
import { db } from '../db/index.ts';
import { and, count, eq, SQL } from 'drizzle-orm';
import { generateJoinCode } from '../utils/genCodes.ts';

const router = express.Router();

router.get('/', (
    req: Request<{}, any, any, MatchListParams>,
    res: Response<MatchListResponse | ApiErrorResponse>,
) => {
  try {
    const { gameId, userId, botId, status, count } = req.query;

    const example = {
      matchId: 6,
      gameId: 0,
      gameTitle: "Frontiers",
      numPlayers: 2,
      maxPlayers: 4,
      status: MatchStatus.PENDING,
      createdAt: new Date(Date.now()),
    }
    res.json([example, example, example]);

  } catch(e) {
    console.error("Creating lobby error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


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
      playerId: p.match_player.id,
      name: p.match_player.name ?? p.user.name,
      colour: p.match_player.colour,
      teamId: p.match_player.teamIndex,
      isHost: true, // TODO: change schema
      isReady: false,
    }));

    res.json({ match: gameMatch, players });
  } catch (e) {
    console.error("Creating lobby error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/create', async (
  req: Request<{}, any, CreateMatchRequest>,
  res: Response<CreateMatchResponse | ApiErrorResponse>,
): Promise<any> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }
    const userId = req.user.userId;
    const joinCode = generateJoinCode();

    const [dbMatch] = await db.insert(match).values({
      gameId: req.body.gameId,
      botsOnly: req.body.botsOnly,
      numPlayers: 1,
      joinCode,
    }).returning();
    if (!dbMatch) return res.status(500).json({ error: "Failed to create match" });

    const [dbMatchPlayer] = await db.insert(matchPlayer).values({
      matchId: dbMatch.id,
      userId,
      teamIndex: 1,
      // colour: "#000000",
      state: {}, // NOTE: this should probably be a default from schema
    }).returning();
    if (!dbMatchPlayer) {
      await db.delete(match).where(eq(match.id, dbMatch.id));
      return res.status(500).json({ error: "Failed to add player to match" });
    }

    return res.json({
      matchId: dbMatch.id,
      playerId: dbMatchPlayer.id,
      joinCode
    });
  } catch(e) {
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
      res.status(401).json({ error: "User not authenticated" });
      return;
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
      if (!dbMatch || !dbMatch.game || !dbMatch.match) {
        return res.status(404).json({ error: "Match not found" });
      }

    if (dbMatch?.match.botsOnly) return res.status(401).json({ error: "Lobby is for bots only" });
    if (dbMatch?.match.status == MatchStatus.ABORTED) {
      return res.status(404).json({ error: "Match closed" });
    }
    if (dbMatch?.match.status != MatchStatus.PENDING) return res.status(400).json({ error: "Match started" });
    if (dbMatch.game && dbMatch.match.numPlayers >= dbMatch.game.maxPlayers) return res.status(400).json({ error: "Lobby is full" });
    if (dbMatch.match.deletedAt && dbMatch.match.deletedAt <= new Date(Date.now())) {
      return res.status(404).json({ error: "Match deleted" });
    }

    // TODO: Add gamerule to allow multiple players on a team
    const existingTeams = await db
      .select({team: matchPlayer.teamIndex})
      .from(matchPlayer)
      .where(eq(matchPlayer.matchId, dbMatch.match.id));
    
    const usedTeams = new Set<number>(existingTeams.map(t => t.team));
    let nextAvailableTeamId = 1;
    while (usedTeams.has(nextAvailableTeamId)) {
      nextAvailableTeamId++;
    }

    const [dbMatchPlayer] = await db.insert(matchPlayer).values({
      matchId: dbMatch.match.id,
      userId: userId,
      teamIndex: nextAvailableTeamId,
      colour: TEAM_MAP[nextAvailableTeamId]?.hex ?? "#676869",
    }).returning();
    if (!dbMatchPlayer) return res.status(500).json({ error: "Failed to join match" });

    await db.update(match).set({ numPlayers: dbMatch.match.numPlayers + 1 });

    return res.json({
      matchId: dbMatch.match.id,
      playerId: dbMatchPlayer.id,
      playerSlot: dbMatch.match.numPlayers + 1,
    });
  } catch(e) {
    console.error("Joining lobby error: ", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/move', (
    req: Request<{}, any, PlayMoveRequest>,
    res: Response<PlayMoveResponse>
) => {
    const { matchId, action, targetX, targetY } = req.body;
    
    const isValid = true;

    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid move" });
    }

    res.json({ success: true, message: "Move accepted", newTurnNumber: 6 });
});



router.post('/leave', async (
  req: Request<{}, any, LeaveMatchRequest>,
  res: Response<LeaveMatchResponse | ApiErrorResponse>,
): Promise<any> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }
    const userId = req.user.userId;
    const { matchId } = req.body;

    await db.transaction(async (tx) => {
      const [dbMatch] = await tx
        .select()
        .from(match)
        .where(eq(match.id, matchId));
      if (!dbMatch) return res.status(404).json({ error: "Match not found" });

      // TODO: if player is the host, transfer host to another player
      if (dbMatch.status === MatchStatus.PENDING) {
        await tx.delete(matchPlayer).where(and(
          eq(matchPlayer.userId, userId),
          eq(matchPlayer.matchId, matchId)
        ));
      } else {
        await tx.update(matchPlayer).set({ abandoned: true }).where(and(
          eq(matchPlayer.userId, userId),
          eq(matchPlayer.matchId, matchId)
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
    });

    const io = req.app.get('io');
    io.to(`/matches/${matchId}`).emit('player_left', { userId });

    res.status(200).json({});
    
  } catch (e) {
    console.error("Leaving lobby error: ", e);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;