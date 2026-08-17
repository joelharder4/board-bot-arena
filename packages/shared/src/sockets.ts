import type { MatchLogEvent } from "./match-logs.ts";
import type { LobbyPlayer } from "./models.ts";


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

export interface PlayerJoinedPayload {
  player: LobbyPlayer;
}

export interface PlayerLeftPayload {
  playerId: number;
  newHostId: number | null;
}

// export interface LobbyStatePayload {
//   players: LobbyPlayer[];
// }

export interface StartMatchPayload {
  matchId: number;
}

export interface MatchStartedPayload {
  state: any;
}