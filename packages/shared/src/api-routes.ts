/* 
Auth & Users
POST /api/auth/register - Create account.
POST /api/auth/login - Returns a JWT.
POST /api/auth/guest - Creates a temporary guest account
GET /api/auth/me - Validates the JWT on page load and returns the user's profile.

Bot Management
POST /api/bots - Create a new bot profile. This will not have code attached to it yet
GET /api/bots - List all bots (limit 20 or something).
POST /api/bots/{botId}/upload - Upload the Python script for the bot. The server saves this to a secure directory for the Docker container to access later.

Matchmaking & Lobbies
POST /api/matches - Create a new match lobby (select the game, max players).
GET /api/matches - List open lobbies looking for players.
GET /api/matches/{matchId} - Get match details (including the current players joined).
POST /api/matches/join - Join a lobby. The body specifies if the user is joining as themselves or entering one of their bots.

Sockets C2S
- join_room
- submit_action
- send_chat (maybe)

Sockets S2C
- player_joined - Tells everyone in the lobby that a new player joined
- match_started
- turn_started - Tells everyone whose turn it is
- state_update
- action_error - Sent only to the player who tried an illegal move

When a lobby starts, it creates a new match record and a match_player record for the host. It then opens a websocket
*/

import { z } from 'zod';
import type { Bot, LobbyPlayer, Match, MatchStatus } from "./models.ts";

export interface ApiErrorResponse {
  error: string;
  details?: any;
}



// POST /api/auth/register
export const createAccountSchema = z.object({
  username: z.string("Please enter a username").min(1, "Username is required").max(32, "Username is too long"),
  email: z.email("Please enter a valid email address").max(254, "Email is too long"),
  password: z.string("Please enter a password").min(15, "Password must be at least 15 characters long").max(256, "You ain't remembering all that"),
});
export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
export interface CreateAccountResponse {
  userId: number;
  token: string;
}

// POST /api/auth/guest
export interface CreateGuestRequest {}
export interface CreateGuestResponse {
  userId: number;
  token: string;
}

// POST /api/auth/login
export const logInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string("Please enter a password"), // don't tell people the requirements
});
export type LogInRequest = z.infer<typeof logInSchema>;
export interface LogInResponse {
  userId: number;
  token: string;
}

export interface RefreshJWTRequest {}
export interface RefreshJWTResponse {
  token: string;
}

export interface LogOutRequest {}
export interface LogOutResponse {}


// POST /api/bots
export interface CreateBotProfileRequest {
  // owner is determined by auth
  name: string;
  description?: string;
}
export interface CreateBotProfileResponse {
  botId: number;
}

// GET /api/bots
export interface BotListParams {
  gameId?: number; // if they want to filter by bots for a specific game
  userId?: number; // if they look at a specific user's bots
  name?: string; // if they search by name
}
export type BotListResponse = Array<Bot>;

// POST /api/bots/{botId}/upload
export interface UploadBotCodeRequest {
  // owner is determined by auth
  gameId: number;
  code: File;
}
export interface UploadBotCodeResponse {
  version?: string;
}


// POST /api/matches
export interface CreateLobbyRequest {
  // host is determined by auth
  gameId: number;
  private: boolean;
}
export interface CreateLobbyResponse {
  matchId: number;
  joinCode: string;
}

// GET /api/matches
export interface MatchListParams {
  gameId?: number;
  userId?: number; // filter lobby with specific person
  botId?: number;  // filter lobbies with a specific bot
  status?: MatchStatus;
}
export type MatchListResponse = Array<Match>;

// GET /api/matches/{matchId}
export interface MatchDetailsParams {
  matchId: number;
}
export interface MatchDetailsResponse {
  match: Match;
  players: Array<LobbyPlayer>;
}

// POST /api/matches/join
export interface JoinMatchRequest {
  // user is determined by auth
  matchId?: number;
  joinCode?: string;
}
export interface JoinMatchResponse {
  matchId: number;
  playerSlot: number;
}




// EXAMPLES:
// Define what the frontend MUST send
export interface PlayMoveRequest {
  matchId: number;
  action: string;
  targetX: number;
  targetY: number;
}

// Define what the backend MUST return
export interface PlayMoveResponse {
  success: boolean;
  message: string;
  newTurnNumber?: number; // Optional
}