import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 3000;

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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Engine is running' });
});

import matchRoutes from './routes/match.ts';
app.use('/api/matches', matchRoutes);


/////////////////////
// START LISTENING //
/////////////////////

server.listen(port, () => {
    console.log(`Board Bot Arena Backend running at http://localhost:${port}`);
});