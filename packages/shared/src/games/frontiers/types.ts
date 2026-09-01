export enum HexEdge {
  E  = 0,
  SE = 1,
  SW = 2,
  W  = 3,
  NW = 4,
  NE = 5,
}

export enum HexCorner {
  NE = 0,
  SE = 1,
  S  = 2,
  SW = 3,
  NW = 4,
  N  = 5,
}

export const ALL_EDGES = [ HexEdge.NE, HexEdge.E, HexEdge.SE, HexEdge.SW, HexEdge.W, HexEdge.NW ] as const;
export const ALL_CORNERS = [ HexCorner.N, HexCorner.NE, HexCorner.SE, HexCorner.S, HexCorner.SW, HexCorner.NW ] as const;

export enum Resource {
  WOOD = "wood",
  BRICK = "brick",
  SHEEP = "sheep",
  WHEAT = "wheat",
  ORE = "ore",
}

export type FrontiersResourceConfig = Record<Resource, number>;

export enum HexType {
  FOREST = "forest",
  QUARRY = "quarry",
  PASTURE = "pasture",
  FIELD = "field",
  MOUNTAIN = "mountain",
  DESERT = "desert",
  WATER = "water",
}

export enum DevCard {
  KNIGHT = "knight",               // 14 in deck
  MONOPOLY = "monopoly",           // 2
  YEAR_OF_PLENTY = "yearOfPlenty", // 2
  ROAD_BUILDING = "roadBuilding",  // 2
  VICTORY_POINT = "victoryPoint",  // 5
}

export type FrontiersDevelopmentCardConfig = Record<DevCard, number>;

export interface FrontiersGameState {
  turnPlayerId: number;
  turnOrder: number[];
  phase: "setup" | "roll" | "build" | "robber";
  lastRoll: { die1: number; die2: number; total: number } | null;
  board: {
    hexes: Array<{ q: number; r: number; type: HexType; resource: Resource | null; diceValue: number | null }>;
    roads: Array<{ playerId: number; q: number; r: number; edge: HexEdge }>;
    buildings: Array<{ playerId: number; type: "settlement" | "city"; q: number; r: number; corner: HexCorner }>;
    ports: Array<{ q: number; r: number; corners: HexEdge; tradeRatio: number; resource: Resource | null }>;
    robber: { q: number; r: number };
  };
  players: Record<number, {
    resources: FrontiersResourceConfig;
    devCards: FrontiersDevelopmentCardConfig;
    victoryPoints: number;
    knightsPlayed: number;
    maxConnectedRoads: number;
    largestArmy: boolean;
    longestRoad: boolean;
  }>;
}