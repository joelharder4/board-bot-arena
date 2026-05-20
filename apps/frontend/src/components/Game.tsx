import { PlayMoveRequest, PlayMoveResponse } from '@board-bot-arena/shared';

async function submitMove() {
    // 1. If you forget 'targetY', React will refuse to compile!
    const payload: PlayMoveRequest = {
        matchId: 101,
        action: "build",
        targetX: 5,
        targetY: 5
    };

    const res = await fetch('http://localhost:3000/api/match/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // 2. We tell TypeScript that the JSON we get back is a PlayMoveResponse
    const data = (await res.json()) as PlayMoveResponse;

    // 3. Perfect autocomplete on 'data'
    if (data.success) {
        console.log(`Move worked! It is now turn ${data.newTurnNumber}`);
    } else {
        console.error(data.message);
    }
}