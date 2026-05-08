import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlayerStore, useAuthStore } from '../store';
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
  const navigate = useNavigate();
  const { currentPlayer } = usePlayerStore();
  const { user, logout } = useAuthStore();
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass bg-slate-950/80 border-b border-yellow-500/10 backdrop-blur-2xl shadow-xl">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-yellow-500/30 bg-black/40 flex items-center justify-center">
            <img src="/logo.png" alt="Jokris99 logo" className="h-10 w-auto object-contain" />
          </div>
          <span className="font-orbitron font-bold text-lg gradient-text-gold tracking-[0.2em]">JOKRIS99</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 font-rajdhani
                ${location.pathname === link.path
                  ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-300 font-rajdhani uppercase tracking-[0.3em]">online</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowPlayerSelect(!showPlayerSelect)}
              className="glass-gold px-4 py-2 rounded-full flex items-center gap-3 text-sm hover:glow-gold transition-all"
            >
              <span className="text-yellow-300 font-rajdhani font-semibold">
                {user ? user.username : 'User'}
              </span>
              {currentPlayer && (
                <span className="text-green-300 font-rajdhani text-xs uppercase tracking-[0.2em]">
                  {currentPlayer.balance?.toLocaleString()} 🪙
                </span>
              )}
              <span className="text-gray-400 text-xs">▼</span>
            </button>

            {showPlayerSelect && (
              <div className="absolute right-0 top-14 w-64 glass border border-yellow-500/20 rounded-3xl overflow-hidden z-50 shadow-2xl">
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors font-rajdhani"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
