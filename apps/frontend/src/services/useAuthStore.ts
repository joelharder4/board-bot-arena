import { create } from 'zustand';

type AuthState = {
  userId: number | null;
  matchId: number | null;
  playerId: number | null;
  setUserId: (id: number | null) => void;
  setMatchId: (id: number | null) => void;
  setPlayerId: (id: number | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  matchId: null,
  playerId: null,
  setUserId: (id) => set({ userId: id }),
  setMatchId: (id) => set({ matchId: id }),
  setPlayerId: (id) => set({ playerId: id }),
}));