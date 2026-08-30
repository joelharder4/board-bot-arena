import { type IGameEngine } from '../engine-interface.ts';
import { FrontiersActionSchema, type FrontiersGameState, type ActionPayload, HexType, HexEdge, HexCorner } from '@board-bot-arena/shared';

export class FrontiersEngine implements IGameEngine {

  parseAction(payload: any) {
    return FrontiersActionSchema.parse(payload);
  }
  
  createInitialState(playerIds: number[]): FrontiersGameState {
    if (playerIds.length < 1 || !playerIds[0]) throw new Error("Not enough players");

    const testBoard = [
      { q: 0, r: 0, type: HexType.DESERT, diceValue: null },
      { q: 0, r: -1, type: HexType.FOREST, diceValue: 6 },
      { q: 1, r: -1, type: HexType.QUARRY, diceValue: 3 },
      { q: 1, r: 0, type: HexType.MOUNTAIN, diceValue: 10 },
      { q: 0, r: 1, type: HexType.PASTURE, diceValue: 8 },
      { q: -1, r: 1, type: HexType.FIELD, diceValue: 4 },
      { q: -1, r: 0, type: HexType.WATER, diceValue: null },
      { q: 0, r: -2, type: HexType.FIELD, diceValue: 2 },
    ];

    const testRoads = [
      { playerId: playerIds[0], q: 0, r: 0, edge: HexEdge.NE },
      { playerId: playerIds[0], q: 0, r: 0, edge: HexEdge.E },
      { playerId: playerIds[0], q: 0, r: 0, edge: HexEdge.SE },
      { playerId: playerIds[0], q: 0, r: 0, edge: HexEdge.SW },
      { playerId: playerIds[0], q: 0, r: 0, edge: HexEdge.W },
      { playerId: playerIds[0], q: 0, r: 0, edge: HexEdge.NW },
    ];

    const testBuildings = [
      { playerId: playerIds[0], q: 0, r: 0, corner: HexCorner.N, type: "settlement" as const },
      { playerId: playerIds[0], q: 0, r: 0, corner: HexCorner.SE, type: "settlement" as const },
      { playerId: playerIds[0], q: 0, r: 0, corner: HexCorner.SW, type: "city" as const },
    ];

    return {
       turnPlayerId: playerIds[0],
       phase: "roll",
       board: {
        hexes: testBoard,
        roads: testRoads,
        buildings: testBuildings,
        ports: [],
        robber: { q: 0, r: 0 }
      },
       players: Object.fromEntries(
        playerIds.map((id) => [id, {
          resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
          devCards: { knight: 0, monopoly: 0, yearOfPlenty: 0, roadBuilding: 0, victoryPoint: 0 },
          victoryPoints: 0,
          knightsPlayed: 0,
          maxConnectedRoads: 0,
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

    if (frontiersMove.kind === "build") {
      const { item, q, r } = frontiersMove.data;
      
      // ... verify player has enough wood/brick ...
      // ... verify the space is empty ...
      // ... deduct resources and add to currentState.board.buildings ...
    }
    
    if (frontiersMove.kind === "roll") {
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