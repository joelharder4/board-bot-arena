import { type IGameEngine } from '../engine-interface.ts';
import { FrontiersActionSchema, type FrontiersGameState, type ActionPayload, HexType, HexEdge, HexCorner, Resource, type LogEventData, LogType, type FrontiersResourceConfig, FrontiersRollLogSchema, FrontiersPickupLogSchema } from '@board-bot-arena/shared';
import { getHexCornerAliases } from './utils.ts';

export class FrontiersEngine implements IGameEngine {

  parseAction(payload: any) {
    return FrontiersActionSchema.parse(payload);
  }
  
  createInitialState(playerIds: number[]): FrontiersGameState {
    if (playerIds.length < 1 || !playerIds[0]) throw new Error("Not enough players");

    // It cant actually be undefined, its just dumb
    const shuffledOrder: number[] = [...playerIds];
    for (let i = shuffledOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j]!, shuffledOrder[i]!];
    }

    const players: Record<number, any> = {};
    for (const id of shuffledOrder) {
      players[id] = {
        resources: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
        devCards: { knight: 0, monopoly: 0, yearOfPlenty: 0, roadBuilding: 0, victoryPoint: 0 },
        victoryPoints: 0,
        knightsPlayed: 0,
        maxConnectedRoads: 0,
        largestArmy: false,
        longestRoad: false,
      };
    }

    const testBoard = [
      { q: 0, r: 0, type: HexType.DESERT, resource: null, diceValue: null },
      { q: 0, r: -1, type: HexType.FOREST, resource: Resource.WOOD, diceValue: 6 },
      { q: 1, r: -1, type: HexType.QUARRY, resource: Resource.BRICK, diceValue: 3 },
      { q: 1, r: 0, type: HexType.MOUNTAIN, resource: Resource.ORE, diceValue: 10 },
      { q: 0, r: 1, type: HexType.PASTURE, resource: Resource.SHEEP, diceValue: 8 },
      { q: -1, r: 1, type: HexType.FIELD, resource: Resource.WHEAT, diceValue: 4 },
      { q: -1, r: 0, type: HexType.WATER, resource: null, diceValue: null },
      { q: 0, r: -2, type: HexType.FIELD, resource: Resource.WHEAT, diceValue: 2 },
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
       turnOrder: [playerIds[0]],
       phase: "roll",
       lastRoll: null,
       board: {
        hexes: testBoard,
        roads: testRoads,
        buildings: testBuildings,
        ports: [],
        robber: { q: 0, r: 0 }
      },
       players: players
    };
  }



  processAction(currentState: FrontiersGameState, playerId: number, genericAction: ActionPayload) {
    const frontiersMove = FrontiersActionSchema.parse(genericAction);
    const generatedLogs: LogEventData[] = [];

    if (currentState.turnPlayerId !== playerId) {
      throw new Error("It is not your turn");
    }

    if (frontiersMove.actionId === "end_turn") {
      if (currentState.phase !== "build") {
        throw new Error("You can't end your turn yet");
      }

      const currentIndex = currentState.turnOrder.indexOf(currentState.turnPlayerId);
      const nextIndex = (currentIndex + 1) % currentState.turnOrder.length;

      currentState.turnPlayerId = currentState.turnOrder[nextIndex]!;
      currentState.phase = "roll";
      currentState.lastRoll = null;

      generatedLogs.push({
        type: LogType.ACTION,
        payload: {
          playerId,
          actionId: "end_turn",
        }
      });
    }

    if (frontiersMove.actionId === "build") {
      const { item, q, r } = frontiersMove.data;
      
      // ... verify player has enough wood/brick ...
      // ... verify the space is empty ...
      // ... deduct resources and add to currentState.board.buildings ...
    }
    
    if (frontiersMove.actionId === "roll") {
      if (currentState.phase !== "roll") throw new Error("It is not the rolling phase");

      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const total = die1 + die2;

      currentState.lastRoll = { die1, die2, total };

      const rollPayload = FrontiersRollLogSchema.parse({
        playerId,
        actionId: "roll",
        data: { die1, die2, total }
      });
      generatedLogs.push({
        type: LogType.ACTION,
        payload: rollPayload
      });

      if (total === 7) {
        currentState.phase = "robber";
        return { newState: currentState, generatedLogs };
      }

      const resourcesGained: Record<number, FrontiersResourceConfig> = {}; // grouped by playerId
      const filtered = currentState.board.hexes.filter(hex => hex.diceValue === total);
      for (const hex of filtered) {
        if (!hex.resource) continue;
        if (currentState.board.robber.q === hex.q && currentState.board.robber.r === hex.r) continue;

        const aliases = getHexCornerAliases(hex.q, hex.r);
        for (const building of currentState.board.buildings) {
          if (aliases.some(v => v.q === building.q && v.r === building.r && v.corner === building.corner)) {
            const amount = building.type === "city" ? 2 : 1;
            const player = currentState.players[building.playerId];
            if (player) {
              player.resources[hex.resource] += amount;
              const totalGained: FrontiersResourceConfig = resourcesGained[building.playerId] ?? { "wood": 0, "brick": 0, "ore": 0, "sheep": 0, "wheat": 0 };
              totalGained[hex.resource] += amount;
              resourcesGained[building.playerId] = totalGained;
            }
          }
        }
      }

      Object.entries(resourcesGained).forEach(([idString, r]) => {
        const pickupPayload = FrontiersPickupLogSchema.parse({
          playerId: parseInt(idString, 10),
          actionId: "pickup",
          data: {
            resources: r,
          }
        });

        generatedLogs.push({
          type: LogType.ACTION,
          payload: pickupPayload
        });
      });
      
      currentState.phase = "build";
    }

    return { newState: currentState, generatedLogs }; 
  }


  checkWinCondition(currentState: FrontiersGameState): number | null {
    for (const [playerId, stats] of Object.entries(currentState.players)) {
      if (stats.victoryPoints >= 10) return Number(playerId);
    }
    return null;
  }
}