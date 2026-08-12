import type { User } from '@board-bot-arena/shared';
import { create } from 'zustand';

type AuthState = {
  isInitialized: boolean;
  user: User | null;
  setIsInitialized: (status: boolean) => void;
  setUser: (newUser: User | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isInitialized: false,
  user: null,
  setIsInitialized: (status) => set({ isInitialized: status }),
  setUser: (newUser) => set({ user: newUser }),
  clearAuth: () => {set({ user: null })}
}));