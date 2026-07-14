import { Server, Socket } from 'socket.io';
import { db } from '../db/index.ts';
import { match, type JoinLobbyPayload } from '@board-bot-arena/shared';
import { eq } from 'drizzle-orm';

export const registerLobbyHandlers = (io: Server, socket: Socket) => {
  
  socket.on('join_room', async (payload: JoinLobbyPayload) => {
    const { matchId } = payload;
    const userId = socket.data.userId;
    
    try {
      console.log("joined the room type shi");
      const [dbMatch] = await db.select().from(match).where(eq(match.id, matchId));
      // TODO: tell the other players that someone joined
      
    } catch (error) {
      console.error('Failed to join room:', error);
      socket.emit('action_error', 'Authentication failed or room error');
    }
  });
};