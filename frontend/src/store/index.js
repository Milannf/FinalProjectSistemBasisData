import { create } from 'zustand';
import { fetchPlayer, fetchPlayers, spinGame, fetchPlayerStats, fetchPlayerHistory } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (usernameOrEmail, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  guestLogin: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data.user, token, isAuthenticated: true });
        return data;
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      localStorage.removeItem('token');
    }
  },
}));

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
      if (!get().currentPlayer && players.length > 0) {
        set({ currentPlayer: players[0] });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  loadPlayerFromAuth: (player) => {
    set({ currentPlayer: player });
  },

  refreshPlayer: async (id) => {
    try {
      const player = await fetchPlayer(id);
      set({ currentPlayer: player });
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
