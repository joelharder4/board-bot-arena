import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './env.ts';
import { setupSocketHandlers } from './sockets/index.ts';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

setupSocketHandlers(io);


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