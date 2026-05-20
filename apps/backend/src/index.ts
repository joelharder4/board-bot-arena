import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const port = process.env.PORT || 3000;

// 1. Middleware
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json()); 

// 2. HTTP Server Setup
// We wrap the Express app in a standard Node HTTP server. 
// Why? Because when you add WebSockets later, they attach to the HTTP server, not Express!
const server = http.createServer(app);

// 3. Basic Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Engine is running' });
});

// Example of how you would mount your match routes:
// import matchRoutes from './routes/match.ts';
// app.use('/api/match', matchRoutes);

// 4. Start the Server
server.listen(port, () => {
    console.log(`🚀 Board Bot Arena Backend running at http://localhost:${port}`);
});