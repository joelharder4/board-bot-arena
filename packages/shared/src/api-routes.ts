


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