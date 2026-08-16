import { type IGameEngine } from '../engine-interface.ts';
import { FrontiersActionSchema, type FrontiersGameState, type ActionPayload } from '@board-bot-arena/shared';

export class FrontiersEngine implements IGameEngine {

  parseAction(payload: any) {
    return FrontiersActionSchema.parse(payload);
  }
  
  createInitialState(playerIds: number[]): FrontiersGameState {
    if (playerIds.length < 1 || !playerIds[0]) throw new Error("Not enough players");

    return {
       turnPlayerId: playerIds[0],
       phase: "setup",
       board: {
        hexes: [],
        roads: [],
        buildings: [],
        ports: [],
        robber: { q: 0, r: 0 }
      },
       players: Object.fromEntries(
        playerIds.map((id) => [id, {
          resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
          devCards: { knight: 0, monopoly: 0, yearOfPlenty: 0, roadBuilding: 0, victoryPoint: 0 },
          victoryPoints: 0,
          knightsPlayed: 0,
          largestArmy: false,
          longestRoad: false,
        }])
       )
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

    return currentState; 
  }

  checkWinCondition(currentState: FrontiersGameState): number | null {
    for (const [playerId, stats] of Object.entries(currentState.players)) {
      if (stats.victoryPoints >= 10) return Number(playerId);
    }
    return null;
  }
}