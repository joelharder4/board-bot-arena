import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../env.ts';
import { registerLobbyHandlers } from './lobbyHandler.ts';
import { registerChatHandlers } from './chatHandler.ts';
import { handlePlayerRemoval } from '../utils/matchService.ts';
import { registerGameHandlers } from './gameHandlers.ts';

export const disconnectTimeouts = new Map<number, NodeJS.Timeout>();
const GRACE_PERIOD_MS = 5000;

export const setupSocketHandlers = (io: Server) => {

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("no token provided"));

        jwt.verify(token, config.JWT_ACCESS_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
            if (err) {
                return next(new Error("jwt expired"));
            }
            
            socket.data.userId = decoded.userId;
            socket.data.name = decoded.name;
            next();
        });
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;

        registerGameHandlers(io, socket);
        registerLobbyHandlers(io, socket);
        registerChatHandlers(io, socket);

        socket.on('disconnect', async () => {
            const matchId = socket.data.matchId;
            if (matchId && userId) {
                const timeout = setTimeout(async () => {
                    await handlePlayerRemoval(matchId, userId, io);
                    disconnectTimeouts.delete(userId);
                }, GRACE_PERIOD_MS);

                disconnectTimeouts.set(userId, timeout);
            }
        });
    });
};