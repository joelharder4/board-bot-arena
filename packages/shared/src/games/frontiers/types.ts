export interface FrontiersResourceConfig {
  wood: number;
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
}

export interface FrontiersGameState {
  turnPlayerId: number;
  phase: "setup" | "main" | "robber";
  board: {
    hexes: Array<{ q: number; r: number; resource: string; diceValue: number }>;
    roads: Array<{ ownerId: number; q: number; r: number; edge: number }>;
    buildings: Array<{ ownerId: number; type: "settlement" | "city"; q: number; r: number; corner: number }>;
  };
  players: Record<number, {
    resources: FrontiersResourceConfig;
    victoryPoints: number;
    longestRoad: boolean;
  }>;
}