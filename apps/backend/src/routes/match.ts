import express, { type Request, type Response } from 'express';
// Import the types from your shared package!
import { type PlayMoveRequest, type PlayMoveResponse } from '@board-bot-arena/shared';

const router = express.Router();

// The Express Request generic takes 4 arguments: Params, ResBody, ReqBody, Query
router.post('/api/match/move', (
    req: Request<{}, any, PlayMoveRequest>, 
    res: Response<PlayMoveResponse>
) => {
    const { matchId, action, targetX, targetY } = req.body; // <-- Perfect autocomplete here!
    
    // Simulate game logic...
    const isValid = true; 

    if (!isValid) {
        // If you typed 'messagee: "Bad"', VSCode would throw an error!
        return res.status(400).json({ success: false, message: "Invalid move" });
    }

    res.json({ success: true, message: "Move accepted", newTurnNumber: 6 });
});