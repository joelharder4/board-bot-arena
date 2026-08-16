export enum HexEdge {
  NE = 0,
  E  = 1,
  SE = 2,
  SW = 3,
  W  = 4,
  NW = 5,
}

export enum HexCorner {
  N  = 0,
  NE = 1,
  SE = 2,
  S  = 3,
  SW = 4,
  NW = 5,
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
  phase: "setup" | "roll" | "build" | "robber";
  board: {
    hexes: Array<{ q: number; r: number; resource: Resource | null; diceValue: number }>;
    roads: Array<{ ownerId: number; q: number; r: number; edge: HexEdge }>;
    buildings: Array<{ ownerId: number; type: "settlement" | "city"; q: number; r: number; corner: HexCorner }>;
    ports: Array<{ q: number; r: number; corners: HexEdge; tradeRatio: number; resource: Resource | null }>;
    robber: { q: number; r: number };
  };
  players: Record<number, {
    resources: FrontiersResourceConfig;
    devCards: FrontiersDevelopmentCardConfig;
    victoryPoints: number;
    knightsPlayed: number;
    largestArmy: boolean;
    longestRoad: boolean;
  }>;
}