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
  numPlayers: number;
  maxPlayers: number;
  status: MatchStatus;
}

export type LobbyPlayer = User | Bot;