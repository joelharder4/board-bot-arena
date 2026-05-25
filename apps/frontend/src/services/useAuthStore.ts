import { create } from 'zustand';

type AuthState = {
  isInitialized: boolean;
  userId: number | null;
  matchId: number | null;
  playerId: number | null;
  setIsInitialized: (status: boolean) => void;
  setUserId: (id: number | null) => void;
  setMatchId: (id: number | null) => void;
  setPlayerId: (id: number | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isInitialized: false,
  userId: null,
  matchId: null,
  playerId: null,
  setIsInitialized: (status) => set({ isInitialized: status }),
  setUserId: (id) => set({ userId: id }),
  setMatchId: (id) => set({ matchId: id }),
  setPlayerId: (id) => set({ playerId: id }),
}));