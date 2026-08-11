import { Server, Socket } from 'socket.io';
import { db } from '../db/index.ts';
import { CHAT_MAX_LENGTH, LogType, matchLog,  MatchLogSchema,  type NewMatchLogPayload,  type SendChatPayload } from '@board-bot-arena/shared';
import { Filter } from 'bad-words';

const filter = new Filter();

export const registerChatHandlers = (io: Server, socket: Socket) => {
  
  socket.on('send_chat', async (payload: SendChatPayload) => {
    const matchId = socket.data.matchId;
    const userId = socket.data.userId;
    const username = socket.data.name;
    const { text } = payload;

    if (!matchId || !text) return;
    
    try {
      let cleanText
      if (text.length <= 300) cleanText = filter.clean(text);
      else cleanText = filter.clean(text.substring(0, CHAT_MAX_LENGTH));
      console.log(`${username}: ${cleanText}`);
      
      const [newLog] = await db.insert(matchLog).values({
        matchId,
        type: LogType.CHAT,
        payload: {
          userId,
          name: username,
          text: cleanText,
        },
      }).returning();
      if (!newLog) throw new Error("Could not insert newLog");

      const validatedLog = MatchLogSchema.parse(newLog);
      const newPayload: NewMatchLogPayload = {
        log: validatedLog,
      }

      io.to(`match_${matchId}`).emit('new_match_log', newPayload);
      
    } catch (error) {
      console.error('Failed to send chat:', error);
      socket.emit('action_error', 'Authentication failed or chat error');
    }
  });
};