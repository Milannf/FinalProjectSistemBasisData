import { create } from 'zustand';
import { fetchPlayer, fetchPlayers, spinGame, fetchPlayerStats, fetchPlayerHistory } from '../services/api';

export const usePlayerStore = create((set, get) => ({
  currentPlayer: null,
  players: [],
  loading: false,
  error: null,

  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  loadPlayers: async () => {
    set({ loading: true });
    try {
      const players = await fetchPlayers();
      set({ players, loading: false });
      // Auto-select first player if none selected
      if (!get().currentPlayer && players.length > 0) {
        set({ currentPlayer: players[0] });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  refreshPlayer: async (id) => {
    try {
      const player = await fetchPlayer(id);
      set({ currentPlayer: player });
      // Update in players list too
      set((state) => ({
        players: state.players.map((p) => (p.id === id ? { ...p, ...player } : p)),
      }));
    } catch (err) {
      console.error('refreshPlayer:', err.message);
    }
  },

  updateBalance: (newBalance) => {
    set((state) => ({
      currentPlayer: state.currentPlayer
        ? { ...state.currentPlayer, balance: newBalance }
        : null,
    }));
  },
}));

export const useGameStore = create((set, get) => ({
  isSpinning: false,
  lastResult: null,
  history: [],
  spinCount: 0,
  notification: null,

  setSpinning: (v) => set({ isSpinning: v }),

  addResult: (result) => {
    set((state) => ({
      lastResult: result,
      history: [result, ...state.history].slice(0, 100),
      spinCount: state.spinCount + 1,
    }));
  },

  setNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => set({ notification: null }), 3000);
  },

  loadHistory: async (playerId) => {
    try {
      const history = await fetchPlayerHistory(playerId, 50);
      set({ history });
    } catch (err) {
      console.error('loadHistory:', err.message);
    }
  },
}));

export const useLeaderboardStore = create((set) => ({
  leaderboard: [],
  recentWins: [],
  hotStreaks: [],
  metric: 'profit',

  setLeaderboard: (data) => set({ leaderboard: data }),
  setRecentWins: (data) => set({ recentWins: data }),
  setHotStreaks: (data) => set({ hotStreaks: data }),
  setMetric: (metric) => set({ metric }),

  updateFromSocket: (data) => {
    if (Array.isArray(data)) set({ leaderboard: data });
  },
}));

export const useSystemStore = create((set) => ({
  onlineCount: 0,
  recentFeed: [],

  setOnlineCount: (count) => set({ onlineCount: count }),
  addFeedItem: (item) => set((state) => ({
    recentFeed: [item, ...state.recentFeed].slice(0, 30),
  })),
}));
