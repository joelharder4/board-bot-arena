import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './env.ts';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// We wrap the Express app in a standard Node HTTP server. 
// Why? Because when you add WebSockets later, they attach to the HTTP server, not Express!
const server = http.createServer(app);


///////////////////////////
// WEBSOCKET CONNECTIONS //
///////////////////////////

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Example: A user joins a specific match room
    socket.on('join_match', (matchId) => {
        socket.join(`match_${matchId}`);
        console.log(`User ${socket.id} joined match_${matchId}`);
        
        socket.to(`match_${matchId}`).emit('notification', 'A new player joined!');
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});


/////////////////
// HTTP ROUTES //
/////////////////
import matchRoutes from './routes/matches.ts';
import authRoutes from './routes/auth.ts';
import { requireAuth, requireRoles } from './middleware/auth.ts';
import { UserRole } from '@board-bot-arena/shared';

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Engine is running' });
});

app.use('/api/matches', requireAuth, requireRoles([UserRole.USER, UserRole.ADMIN]), matchRoutes);
app.use('/api/auth', authRoutes);


/////////////////////
// START LISTENING //
/////////////////////

server.listen(config.PORT, () => {
    console.log(`Boardgame Bot Arena Backend running at http://localhost:${config.PORT}`);
});