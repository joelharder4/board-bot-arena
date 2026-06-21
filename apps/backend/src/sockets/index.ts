import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../env.ts';
import { registerLobbyHandlers } from './lobbyHandler.ts';

export const setupSocketHandlers = (io: Server) => {

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("no token provided"));

        jwt.verify(token, config.JWT_ACCESS_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
            if (err) {
                return next(new Error("jwt expired"));
            }
            
            socket.data.userId = decoded.userId;
            next();
        });
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`Client connected: ${socket.id} (UserId: ${userId})`);

        registerLobbyHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id} (UserId: ${userId})`);
            // Handle any necessary cleanup (like notifying a lobby that a user dropped)
        });
    });
};