import type { ActionPayload } from "@board-bot-arena/shared";

export interface IGameEngine {
  parseAction(payload: any): any;
  createInitialState(playerIds: number[]): any;
  processAction(currentState: any, playerId: number, action: ActionPayload): any;
  checkWinCondition(currentState: any): number | null;
}