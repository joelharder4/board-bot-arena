import { Server, Socket } from 'socket.io';
import { db } from '../db/index.ts';
import type { JoinLobbyPayload } from '@board-bot-arena/shared';

export const registerLobbyHandlers = (io: Server, socket: Socket) => {
  
  socket.on('join_room', async (payload: JoinLobbyPayload) => {
    const userId = socket.data.userId;
    
    try {
      console.log("joined the room type shi")
      
    } catch (error) {
      console.error('Failed to join room:', error);
      socket.emit('action_error', 'Authentication failed or room error');
    }
  });
};