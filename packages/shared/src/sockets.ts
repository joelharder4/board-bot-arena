import type { MatchLogEvent } from "./match-logs.ts";


export interface JoinLobbyPayload {
  matchId: number;
}

export interface LeaveLobbyPayload {
  matchId: number;
}

export interface SendChatPayload {
  text: string;
}

export interface NewMatchLogPayload {
  log: MatchLogEvent;
}