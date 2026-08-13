import { Server, Socket } from 'socket.io';
import { db } from '../db/index.ts';
import { matchPlayer, type JoinLobbyPayload, type LeaveLobbyPayload, type LobbyPlayer } from '@board-bot-arena/shared';
import { and, eq } from 'drizzle-orm';

export const registerLobbyHandlers = (io: Server, socket: Socket) => {
  
  socket.on('join_room', async (payload: JoinLobbyPayload) => {
    const { matchId } = payload;
    const userId = socket.data.userId;
    const username = socket.data.name;

    const roomName = `match_${matchId}`;
    socket.join(roomName);
    socket.data.matchId = matchId;
    
    try {
      const [dbPlayer] = await db
        .select()
        .from(matchPlayer)
        .where(and( 
          eq(matchPlayer.matchId, matchId),
          eq(matchPlayer.userId, userId)
        ));
      if (!dbPlayer) throw new Error("Player cannot be found");
      
      const newPlayer: LobbyPlayer = {
        type: "user",
        userId,
        playerId: dbPlayer.id,
        name: username,
        colour: dbPlayer.colour,
        teamId: dbPlayer.teamIndex,
        isHost: dbPlayer.isHost,
      }

      socket.to(roomName).emit("player_joined", { player: newPlayer });
      
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