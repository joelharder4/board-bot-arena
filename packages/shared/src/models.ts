export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export interface User {
  type: "user";
  userId: number;
  name: string;
  role: UserRole;
}

export interface Bot {
  type: "bot";
  botId: number;
  ownerId: number;
  name: string;
  gameIds: Array<number>;
}

export enum MatchStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  ABORTED = "aborted",
}

export interface Match {
  matchId: number;
  gameId: number;
  joinCode?: string;
  gameTitle: string;
  numPlayers: number;
  maxPlayers: number;
  status: MatchStatus;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface LobbyPlayer {
  type: "user" | "bot";
  playerId: number;
  ownerId?: number;
  name: string;
  colour: string;
  teamId: number;
  isHost: boolean;
  isReady: boolean;
}

export enum LogType {
  CHAT = "chat",
  SYSTEM = "system",
  ACTION = "action",
  TRADE = "trade"
}