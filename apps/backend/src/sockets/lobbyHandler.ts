import { Server, Socket } from 'socket.io';
import { db } from '../db/index.ts';
import { bot, matchPlayer, user, type JoinLobbyPayload, type LeaveLobbyPayload, type LobbyPlayer } from '@board-bot-arena/shared';
import { and, eq } from 'drizzle-orm';
import { toLobbyPlayer } from '../utils/typing.ts';
import { disconnectTimeouts } from './index.ts';

export const registerLobbyHandlers = (io: Server, socket: Socket) => {
  
  socket.on('join_room', async (payload: JoinLobbyPayload) => {
    const { matchId } = payload;
    const userId = socket.data.userId;
    const username = socket.data.name;

    const roomName = `match_${matchId}`;
    
    try {
      if (disconnectTimeouts.has(userId)) {
        // console.log(`User ${userId} reconnected!`);
        clearTimeout(disconnectTimeouts.get(userId));
        disconnectTimeouts.delete(userId);
      }

      const [dbPlayer] = await db
        .select()
        .from(matchPlayer)
        .where(and( 
          eq(matchPlayer.matchId, matchId),
          eq(matchPlayer.userId, userId)
        ));
      if (!dbPlayer) {
        socket.emit('action_error', 'You must join this match from the main menu.');
        return; 
      }

      socket.join(roomName);
      socket.data.matchId = matchId;
      
      const thisPlayer: LobbyPlayer = {
        type: "user",
        userId,
        playerId: dbPlayer.id,
        name: username,
        colour: dbPlayer.colour,
        teamId: dbPlayer.teamIndex,
        isHost: dbPlayer.isHost,
      }

      // const rawPlayers = await db
      //   .select()
      //   .from(matchPlayer)
      //   .leftJoin(user, eq(matchPlayer.userId, user.id))
      //   .leftJoin(bot, eq(matchPlayer.botId, bot.id))
      //   .where(eq(matchPlayer.matchId, matchId));
      
      // const allLobbyPlayers: LobbyPlayer[] = toLobbyPlayer(rawPlayers);

      // socket.emit('match_state', { players: allLobbyPlayers });

      socket.to(roomName).emit("player_joined", { player: thisPlayer });
      
    } catch (error) {
      console.error('Failed to join room:', error);
      socket.emit('action_error', 'Authentication failed or room error');
    }
  });

  socket.on('leave_room', (payload: LeaveLobbyPayload) => {
    const { matchId } = payload;
    const roomName = `match_${matchId}`;

    socket.leave(roomName);
    socket.data.matchId = null;
  });
};