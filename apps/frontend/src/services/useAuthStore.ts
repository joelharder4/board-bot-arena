import { create } from 'zustand';

type AuthState = {
  isInitialized: boolean;
  userId: number | null;
  setIsInitialized: (status: boolean) => void;
  setUserId: (id: number | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isInitialized: false,
  userId: null,
  setIsInitialized: (status) => set({ isInitialized: status }),
  setUserId: (id) => set({ userId: id }),
  clearAuth: () => {set({ isInitialized: false, userId: null })}
}));