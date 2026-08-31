import type { ActionPayload, LogEventData } from "@board-bot-arena/shared";

export interface IGameEngine {
  parseAction(payload: any): any;
  createInitialState(playerIds: number[]): any;
  processAction(currentState: any, playerId: number, action: ActionPayload): { newState: any, generatedLogs: LogEventData[] };
  checkWinCondition(currentState: any): number | null;
}