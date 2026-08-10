import type { ActionPayload } from "@board-bot-arena/shared";

export interface IGameEngine {
  // Returns the initial JSON object
  createInitialState(playerIds: number[]): any;
  
  // Validates the move, mutates state, returns new state (or throws error)
  processAction(currentState: any, playerId: number, action: ActionPayload): any;
  
  // Checks if someone won
  checkWinCondition(currentState: any): number | null;
}