import { type IGameEngine } from '../engine-interface.ts';
import { FrontiersActionSchema, type FrontiersGameState, type ActionPayload } from '@board-bot-arena/shared';

export class FrontiersEngine implements IGameEngine {
  
  createInitialState(playerIds: number[]): FrontiersGameState {
    if (playerIds.length < 1 || !playerIds[0]) throw new Error("Not enough players");

    return {
       turnPlayerId: playerIds[0],
       phase: "setup",
       board: { hexes: [], roads: [], buildings: [] },
       players: {} // initialize with 0 resources
    };
  }

  processAction(currentState: FrontiersGameState, playerId: number, genericAction: ActionPayload): FrontiersGameState {
    const frontiersMove = FrontiersActionSchema.parse(genericAction);

    if (currentState.turnPlayerId !== playerId) {
      throw new Error("It is not your turn");
    }

    if (frontiersMove.actionId === "build") {
      const { item, q, r } = frontiersMove.data;
      
      // ... verify player has enough wood/brick ...
      // ... verify the space is empty ...
      // ... deduct resources and add to currentState.board.buildings ...
    }
    
    if (frontiersMove.actionId === "roll") {
       // ... roll math random, distribute resources ...
    }

    // 4. RETURN NEW STATE
    return currentState; 
  }

  checkWinCondition(currentState: FrontiersGameState): number | null {
    for (const [playerId, stats] of Object.entries(currentState.players)) {
      if (stats.victoryPoints >= 10) return Number(playerId);
    }
    return null;
  }
}