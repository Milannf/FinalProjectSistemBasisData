import { Link, useLocation } from 'react-router-dom';
import { usePlayerStore, useSystemStore } from '../store';
import { useState } from 'react';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/casino', label: 'Casino', icon: '🎰' },
  { path: '/games', label: 'Games', icon: '🎮' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function Navbar() {
  const location = useLocation();
  const { currentPlayer, players, setCurrentPlayer } = usePlayerStore();
  const { onlineCount } = useSystemStore();
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-yellow-500/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          <span className="font-orbitron font-bold text-lg gradient-text-gold">JOKRIS99</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 font-rajdhani
                ${location.pathname === link.path
                  ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/08'
                }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Online indicator */}
          <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400 font-rajdhani">{onlineCount} online</span>
          </div>

          {/* Player selector */}
          <div className="relative">
            <button
              onClick={() => setShowPlayerSelect(!showPlayerSelect)}
              className="glass-gold px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm hover:glow-gold transition-all"
            >
              <span className="text-yellow-400 font-rajdhani font-semibold">
                {currentPlayer ? currentPlayer.username : 'Select Player'}
              </span>
              {currentPlayer && (
                <span className="text-green-400 font-rajdhani text-xs">
                  {currentPlayer.balance?.toLocaleString()} 🪙
                </span>
              )}
              <span className="text-gray-400 text-xs">▼</span>
            </button>

            {showPlayerSelect && (
              <div className="absolute right-0 top-12 w-56 glass border border-yellow-500/20 rounded-xl overflow-hidden z-50 shadow-2xl">
                <div className="p-2 max-h-64 overflow-y-auto">
                  {players.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setCurrentPlayer(p); setShowPlayerSelect(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                        ${currentPlayer?.id === p.id ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-300 hover:bg-white/05'}`}
                    >
                      <div className="font-semibold font-rajdhani">{p.username}</div>
                      <div className="text-xs text-gray-500">{p.balance?.toFixed(0)} coins</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
