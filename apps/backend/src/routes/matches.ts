import express, { type Request, type Response } from 'express';
import { type PlayMoveRequest, type PlayMoveResponse } from '@board-bot-arena/shared';

const router = express.Router();

// The Express Request generic takes 4 arguments: Params, ResBody, ReqBody, Query
router.post('/move', (
    req: Request<{}, any, PlayMoveRequest>, 
    res: Response<PlayMoveResponse>
) => {
    const { matchId, action, targetX, targetY } = req.body;
    
    const isValid = true;

    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid move" });
    }

    res.json({ success: true, message: "Move accepted", newTurnNumber: 6 });
});

export default router;