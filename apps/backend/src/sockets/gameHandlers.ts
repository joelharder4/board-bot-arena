import { game, match, matchLog, MatchLogSchema, matchPlayer, MatchStatus, type GameEndedPayload, type MakeActionPayload, type MatchLogEvent, type MatchStartedPayload, type MatchStateUpdatePayload, type NewMatchLogPayload, type StartMatchPayload } from '@board-bot-arena/shared';
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


  socket.on('make_action', async (
    payload: MakeActionPayload,
    callback?: (response: { success: boolean; error?: string }) => void,
  ) => {
    try {
      const { matchId, action } = payload;
      const userId = socket.data.userId;

      if (!matchId || !action) throw new Error("Malformed payload: Missing matchId or action envelope.");
      if (!userId) throw new Error("Unauthorized: Missing userId on socket.");

      const txResult = await db.transaction(async (tx) => {
        const [dbMatch] = await tx.select().from(match).innerJoin(game, eq(game.id, match.gameId)).where(eq(match.id, matchId));
        const [dbPlayer] = await tx
          .select()
          .from(matchPlayer)
          .where(and(
            eq(matchPlayer.matchId, matchId),
            eq(matchPlayer.userId, userId)
          ));
        
        if (!dbMatch || !dbPlayer) throw new Error("Player is not in that match");
        if (dbMatch.match.status !== MatchStatus.IN_PROGRESS) throw new Error("Match is not in progress");
        
        const engine = getEngine(dbMatch.game.name);
        const parsedAction = engine.parseAction(action);
        const { newState, generatedLogs } = engine.processAction(dbMatch.match.state, dbPlayer.id, parsedAction);
        
        let finalStatus = dbMatch.match.status;
        const winningPlayer = engine.checkWinCondition(newState);
        
        if (winningPlayer) {
          finalStatus = MatchStatus.COMPLETED;
          await tx.update(matchPlayer).set({ isWinner: true }).where(eq(matchPlayer.id, winningPlayer));
        }

        await tx.update(match)
          .set({ state: newState, status: finalStatus })
          .where(eq(match.id, matchId));
        
        const processedLogs: MatchLogEvent[] = [];
        
        for (const log of generatedLogs) {
          const [newLog] = await tx.insert(matchLog).values({
            matchId,
            type: log.type,
            payload: log.payload,
          }).returning();
          
          if (!newLog) throw new Error("Could not insert newLog");

          const rawEvent = {
            id: newLog.id,
            matchId,
            createdAt: newLog.createdAt,
            type: newLog.type,
            payload: newLog.payload,
          };

          processedLogs.push(MatchLogSchema.parse(rawEvent));
        }

        return { newState, processedLogs, winningPlayer };
      });

      const updatePayload: MatchStateUpdatePayload = { state: txResult.newState };
      io.to(`match_${matchId}`).emit('match_state_update', updatePayload);

      for (const validLog of txResult.processedLogs) {
        const logPayload: NewMatchLogPayload = { log: validLog };
        io.to(`match_${matchId}`).emit("new_match_log", logPayload);
      }

      if (txResult.winningPlayer) {
        console.log(`HOLY MOLY PLAYER ${txResult.winningPlayer} JUST WON!!`);
        const endPayload: GameEndedPayload = { winner: txResult.winningPlayer };
        io.to(`match_${matchId}`).emit('game_ended', endPayload);
      }

      if (typeof callback === 'function') {
        callback({ success: true });
      }

    } catch(e) {
      console.error("Failed to make action: ", e);
      const message = e instanceof Error ? e.message : "Invalid move";
      
      socket.emit('action_error', { message });

      if (typeof callback === 'function') {
        callback({ success: false, error: message });
      }
    }
  });
};