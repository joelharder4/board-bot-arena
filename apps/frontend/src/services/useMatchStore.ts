import type { FrontiersGameState, LobbyPlayer, Match, MatchLogEvent, MatchStatus } from '@board-bot-arena/shared';
import { create } from 'zustand';

type MatchStoreState = {
  matchId: number | null;
  matchStatus: MatchStatus | null;
  setMatchId: (id: number | null) => void;
  setMatchStatus: (status: MatchStatus) => void;

  match: Match | null;
  setMatch: (match: Match) => void;

  playerId: number | null;
  playerList: LobbyPlayer[];
  setPlayerId: (id: number | null) => void;
  setPlayerList: (players: LobbyPlayer[]) => void;
  appendPlayer: (player: LobbyPlayer) => void;
  removePlayer: (playerId: number) => void;
  setHostPlayer: (playerId: number) => void;
  setPlayerAbandoned: (playerId: number) => void;
  setPlayerReturned: (player: number) => void;

  matchLog: MatchLogEvent[];
  setMatchLog: (log: MatchLogEvent[]) => void;
  appendMatchLog: (newLog: MatchLogEvent) => void;

  gameState: FrontiersGameState | null;
  setGameState: (state: FrontiersGameState) => void;

  clearMatch: () => void;
};

export const useMatchStore = create<MatchStoreState>((set) => ({
  matchId: null,
  matchStatus: null,
  match: null,
  gameName: null,
  playerId: null,
  playerList: [],
  matchLog: [],

  setMatchId: (id) => set({ matchId: id }),
  setMatchStatus: (status) => set({ matchStatus: status }),
  setMatch: (match) => set({ match: match }),

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
  setPlayerAbandoned: (playerId: number) => set((state) => {
    return { playerList: state.playerList.map((p) => {
      if (p.playerId === playerId) p.abandoned = true;
      return p;
    })}
  }),
  setPlayerReturned: (playerId: number) => set((state) => {
    return { playerList: state.playerList.map((p) => {
      if (p.playerId === playerId) p.abandoned = false;
      return p;
    })}
  }),

  setMatchLog: (log) => set({ matchLog: log }),
  appendMatchLog: (newLog) => set((state) => ({ matchLog: [...state.matchLog, newLog] })),

  gameState: null,
  setGameState: (state) => {set({ gameState: state })},

  clearMatch: () => {set({ matchId: null, matchStatus: null, match: null, playerId: null, playerList: [], matchLog: [], gameState: null })},
}));