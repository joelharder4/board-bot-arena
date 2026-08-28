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

interface BaseLobbyPlayer {
  playerId: number;
  name: string;
  colour: string;
  teamId: number;
  abandoned: boolean;
}

export interface LobbyUser extends BaseLobbyPlayer {
  type: "user";
  userId: number;
  isHost: boolean;
}
export interface LobbyBot extends BaseLobbyPlayer {
  type: "bot";
  botId: number;
}

export type LobbyPlayer = LobbyUser | LobbyBot;

export interface BaseMatchPlayer {
  playerId: number;
  name: string;
  colour: string;
  teamId: number;
  victoryPoints: number;
  maxConnectedRoads: number;
  knightsPlayed: number;
  longestRoad: boolean;
  largestArmy: boolean;
}

export interface MatchUser extends BaseMatchPlayer {
  type: "user";
  userId: number;
  isHost: boolean;
}

export interface MatchBot extends BaseMatchPlayer {
  type: "bot";
  botId: number;
}

export type MatchPlayer = MatchUser | MatchBot;

export enum LogType {
  CHAT = "chat",
  SYSTEM = "system",
  ACTION = "action",
  TRADE = "trade"
}