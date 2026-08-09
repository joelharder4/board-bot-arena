import type { LobbyPlayer } from '@board-bot-arena/shared';
import { create } from 'zustand';

type MatchState = {
  matchId: number | null;
  playerId: number | null;
  playerList: LobbyPlayer[];
  setMatchId: (id: number | null) => void;
  setPlayerId: (id: number | null) => void;
  setPlayerList: (players: LobbyPlayer[]) => void;
  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  matchId: null,
  playerId: null,
  playerList: [],
  setMatchId: (id) => set({ matchId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  setPlayerList: (players) => set({ playerList: players }),
  clearMatch: () => {set({ matchId: null, playerId: null, playerList: [] })}
}));