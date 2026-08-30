import { game, match, matchPlayer, MatchStatus, type GameEndedPayload, type MakeActionPayload, type MatchStartedPayload, type MatchStateUpdatePayload, type StartMatchPayload } from '@board-bot-arena/shared';
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


  socket.on('make_action', async (payload: MakeActionPayload) => {
    try {
      const { matchId, action } = payload;
      const userId = socket.data.userId;

      const [dbMatch] = await db.select().from(match).innerJoin(game, eq(game.id, match.gameId)).where(eq(match.id, matchId));
      const [dbPlayer] = await db
        .select()
        .from(matchPlayer)
        .where(and(
          eq(matchPlayer.matchId, matchId),
          eq(matchPlayer.userId, userId)
        ));
      
      if (!dbMatch || !dbPlayer) {
        return socket.emit('action_error', { message: "Player is not in that match" });
      }

      if (dbMatch.match.status !== MatchStatus.IN_PROGRESS) {
        return socket.emit('action_error', { message: "Match is not in progress" });
      }
      
      const engine = getEngine(dbMatch.game.name);
      const parsedAction = engine.parseAction(action);

      const newState = engine.processAction(dbMatch.match.state, dbPlayer.id, parsedAction);
      await db.update(match)
        .set({ state: newState })
        .where(eq(match.id, matchId));
      
      const updatePayload: MatchStateUpdatePayload = { state: newState };
      io.to(`match_${matchId}`).emit('match_state_update', updatePayload);

      const winningPlayer = engine.checkWinCondition(newState);
      if (winningPlayer) {
        console.log(`HOLY MOLY PLAYER ${winningPlayer} JUST WON!!`);
        await db.update(match).set({ status: MatchStatus.COMPLETED }).where(eq(match.id, matchId));
        await db.update(matchPlayer).set({ isWinner: true }).where(eq(matchPlayer.id, winningPlayer));

        const endPayload: GameEndedPayload = { winner: winningPlayer }
        io.to(`match_${matchId}`).emit('game_ended', endPayload);
      }

    } catch(e) {
      console.error("Failed to make action: ", e);
      socket.emit('action_error', { message: e instanceof Error ? e.message : "Invalid move" });
    }
  });
};