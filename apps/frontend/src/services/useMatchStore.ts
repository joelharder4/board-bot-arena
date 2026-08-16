import type { FrontiersGameState, LobbyPlayer, MatchLogEvent } from '@board-bot-arena/shared';
import { create } from 'zustand';

type MatchState = {
  matchId: number | null;
  setMatchId: (id: number | null) => void;

  playerId: number | null;
  playerList: LobbyPlayer[];
  setPlayerId: (id: number | null) => void;
  setPlayerList: (players: LobbyPlayer[]) => void;
  appendPlayer: (player: LobbyPlayer) => void;
  removePlayer: (playerId: number) => void;
  setHostPlayer: (playerId: number) => void;

  matchLog: MatchLogEvent[];
  setMatchLog: (log: MatchLogEvent[]) => void;
  appendMatchLog: (newLog: MatchLogEvent) => void;

  gameState: FrontiersGameState | null;
  setGameState: (state: FrontiersGameState) => void;

  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  matchId: null,
  playerId: null,
  playerList: [],
  matchLog: [],
  setMatchId: (id) => set({ matchId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  setPlayerList: (players) => set({ playerList: players }),
  appendPlayer:
    (player) => set(
      (state) => {
        if (state.playerList.some((p) => p.playerId === player.playerId)) {
          return state;
        }
        return { playerList: [...state.playerList, player] };
      }
    ),
  removePlayer:
    (playerId) => set(
      (state) => ({
        playerList: state.playerList.filter((p) => p.playerId !== playerId)
      })
    ),
  setHostPlayer: (playerId) => set(
    (state) => {
      return { playerList: state.playerList.map((p) => {
        if (p.type === "user") p.isHost = p.playerId === playerId;
        return p;
      }) }
    }
  ),
  setMatchLog: (log) => set({ matchLog: log }),
  appendMatchLog: (newLog) => set((state) => ({ matchLog: [...state.matchLog, newLog] })),

  gameState: null,
  setGameState: (state) => {set({ gameState: state })},
  clearMatch: () => {set({ matchId: null, playerId: null, playerList: [], matchLog: [], gameState: null })},
}));