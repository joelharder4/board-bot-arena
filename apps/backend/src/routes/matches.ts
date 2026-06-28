import express, { type Request, type Response } from 'express';
import { game, match, matchPlayer, MatchStatus, type ApiErrorResponse, type CreateMatchRequest, type CreateMatchResponse, type JoinMatchRequest, type JoinMatchResponse, type Match, type MatchListParams, type MatchListResponse, type PlayMoveRequest, type PlayMoveResponse } from '@board-bot-arena/shared';
import { db } from '../db/index.ts';
import { eq } from 'drizzle-orm';
import { generateJoinCode } from '../utils/genCodes.ts';

const router = express.Router();

router.get('/', (
    req: Request<MatchListParams>,
    res: Response<MatchListResponse | ApiErrorResponse>,
) => {
    const { gameId, userId, botId, status, count } = req.params;

    const example = {
      matchId: 6,
      gameId: 0,
      gameTitle: "Catan",
      numPlayers: 2,
      maxPlayers: 4,
      status: MatchStatus.PENDING,
      createdAt: new Date(Date.now()),
    }
    res.json([example, example, example]);
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

    // insert matchPlayer entry
    const [dbMatchPlayer] = await db.insert(matchPlayer).values({
      matchId: dbMatch.id,
      userId,
      // colour: "#000000",
      state: {},
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
    if (!matchId && !joinCode) {
      return res.status(400).json({ error: "did not provide a match id or join code" });
    }

    let dbMatch;

    if (matchId) {
      [dbMatch] = await db.select().from(match).leftJoin(game, eq(game.id, match.gameId)).where(eq(match.id, matchId));
      if (!dbMatch || !dbMatch.game || !dbMatch.match) {
        return res.status(404).json({ error: "Match not found" });
      }
    } else {
      // TODO: JOIN CODES
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

    const [dbMatchPlayer] = await db.insert(matchPlayer).values({
      matchId: dbMatch.match.id,
      userId: userId,
      colour: "#676767", // TODO: ASSIGN COLOURS
    }).returning();
    if (!dbMatchPlayer) return res.status(500).json({ error: "Failed to join match" });

    await db.update(match).set({ numPlayers: dbMatch.match.numPlayers + 1 });

    return res.json({
      matchId: dbMatch.match.id,
      playerId: dbMatchPlayer.id,
      playerSlot: dbMatch.match.numPlayers + 1,
    });
  } catch(e) {
    console.error("Joining lobby error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// The Express Request generic takes 4 arguments: Params, ResBody, ReqBody, Query
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

export default router;