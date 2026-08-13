import type { LobbyPlayer, MatchLogEvent } from '@board-bot-arena/shared';
import { create } from 'zustand';

type MatchState = {
  matchId: number | null;
  playerId: number | null;
  playerList: LobbyPlayer[];
  matchLog: MatchLogEvent[];
  setMatchId: (id: number | null) => void;
  setPlayerId: (id: number | null) => void;
  setPlayerList: (players: LobbyPlayer[]) => void;
  appendPlayer: (player: LobbyPlayer) => void;
  removePlayer: (playerId: number) => void;
  setMatchLog: (log: MatchLogEvent[]) => void;
  appendMatchLog: (newLog: MatchLogEvent) => void;
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
  appendPlayer: (player) => set((state) => ({ playerList: [...state.playerList, player] })),
  removePlayer:
    (playerId) => set(
      (state) => ({
        playerList: state.playerList.filter((p) => p.playerId !== playerId)
      })
    ),
  setMatchLog: (log) => set({ matchLog: log }),
  appendMatchLog: (newLog) => set((state) => ({ matchLog: [...state.matchLog, newLog] })),
  clearMatch: () => {set({ matchId: null, playerId: null, playerList: [], matchLog: [] })}
}));