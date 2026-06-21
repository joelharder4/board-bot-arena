import { create } from 'zustand';

type MatchState = {
  matchId: number | null;
  playerId: number | null;
  setMatchId: (id: number | null) => void;
  setPlayerId: (id: number | null) => void;
  clearMatch: () => void;
};

export const useMatchStore = create<MatchState>((set) => ({
  matchId: null,
  playerId: null,
  setMatchId: (id) => set({ matchId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  clearMatch: () => {set({ matchId: null, playerId: null })}
}));