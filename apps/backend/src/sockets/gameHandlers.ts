import { game, match, matchPlayer, MatchStatus, type MatchStartedPayload, type StartMatchPayload } from '@board-bot-arena/shared';
import { Server, Socket } from 'socket.io';
import { db } from '../db/index.ts';
import { and, eq } from 'drizzle-orm';
import { getEngine } from '../game-engines/index.ts';

export const registerGameHandlers = (io: Server, socket: Socket) => {
  
  socket.on('start_game', async (payload: StartMatchPayload) => {
    try {
      const { matchId } = payload;
      const userId = socket.data.userId;

      const [dbMatch] = await db.select().from(match).innerJoin(game, eq(game.id, match.gameId)).where(eq(match.id, matchId));
      const [dbPlayer] = await db
        .select()
        .from(matchPlayer)
        .where(and(eq(matchPlayer.matchId, matchId), eq(matchPlayer.userId, userId)));
      
      if (!dbMatch || !dbPlayer?.isHost) {
        return socket.emit('action_error', { message: "Only the host can start the game" });
      }

      if (dbMatch.match.status !== MatchStatus.PENDING) {
        return socket.emit('action_error', { message: "Match has already started" });
      }


      const players = await db.select().from(matchPlayer).where(eq(matchPlayer.matchId, matchId));
      const playerIds = players.map((p) => p.id);

      const engine = getEngine(dbMatch.game.name);
      const initialState = engine.createInitialState(playerIds);

      await db.update(match).set({
        status: MatchStatus.IN_PROGRESS,
        state: initialState,
      })
      .where(eq(match.id, matchId));

      const response: MatchStartedPayload = {
        state: initialState,
      }
      io.to(`match_${matchId}`).emit('match_started', response);

    } catch(e) {
      console.error("Failed to initialize lobby: ", e);
      socket.emit('action_error', { message: "Failed to initialize lobby." })
    }

  });
};