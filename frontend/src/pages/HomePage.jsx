import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlayerStore, useLeaderboardStore, useSystemStore } from '../store';
import { fetchLeaderboard } from '../services/api';

export default function HomePage() {
  const { players, loadPlayers, currentPlayer, setCurrentPlayer } = usePlayerStore();
  const { leaderboard, setLeaderboard, recentWins } = useLeaderboardStore();
  const { onlineCount, recentFeed } = useSystemStore();

  useEffect(() => {
    loadPlayers();
    fetchLeaderboard('profit').then((data) => {
      if (data?.leaderboard) setLeaderboard(data.leaderboard);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-grid">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/08 via-purple-500/04 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-gradient-to-b from-yellow-500/12 via-transparent to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/3 w-72 h-72 bg-purple-500/08 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/3 w-72 h-72 bg-cyan-500/08 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-green-500/40 bg-green-500/05">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-rajdhani uppercase tracking-widest">
              {onlineCount} Players Online Now
            </span>
          </div>

          <h1 className="font-orbitron text-7xl md:text-9xl font-black mb-6 leading-none drop-shadow-lg">
            <span className="gradient-text-gold text-glow-gold">JOKRIS99</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl mb-4 font-rajdhani max-w-2xl mx-auto font-medium">
            Premium Virtual Casino Experience
          </p>
          <p className="text-gray-400 text-base mb-6 font-rajdhani max-w-2xl mx-auto">
            Immersive gaming with adaptive RTP, realtime leaderboards, and premium rewards.
          </p>
          <p className="text-yellow-400/70 text-sm mb-12 font-rajdhani flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>Virtual coins only — not real gambling</span>
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/games"
              className="spin-btn relative px-12 py-5 rounded-2xl font-orbitron font-bold text-black text-lg glow-gold hover:scale-105 transition-transform duration-300"
              style={{ background: 'linear-gradient(135deg, #f5c518, #b8960c)', borderRadius: '16px', boxShadow: '0 0 30px rgba(245, 197, 24, 0.5)' }}
            >
              🎰 PLAY NOW
            </Link>
            <Link
              to="/leaderboard"
              className="glass border border-yellow-500/40 px-10 py-5 rounded-2xl font-rajdhani font-bold text-yellow-400 text-lg hover:bg-yellow-500/10 transition-all"
            >
              🏆 Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-white/05 bg-white/02 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-12 flex-wrap">
          {[
            { label: 'Total Players', value: players.length, icon: '👤' },
            { label: 'Online Now', value: onlineCount, icon: '🟢' },
            { label: 'Dynamic RTP', value: 'Adaptive', icon: '🧠' },
            { label: 'Realtime', value: 'Socket.IO', icon: '⚡' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-orbitron font-bold text-yellow-400">{s.icon} {s.value}</div>
              <div className="text-xs text-gray-500 font-rajdhani uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Winners */}
        <div className="lg:col-span-2">
          <h2 className="font-orbitron text-xl font-bold gradient-text-gold mb-6 flex items-center gap-2">
            🏆 Top Winners
          </h2>
          <div className="space-y-3">
            {leaderboard.slice(0, 8).map((entry, i) => (
              <div key={entry.playerId || i} className={`glass border border-white/05 rounded-xl p-4 card-hover flex items-center gap-4`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-bold text-sm ${
                  i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'bg-white/10 text-gray-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-rajdhani font-bold text-white">{entry.username || 'Player'}</div>
                  <div className="text-xs text-gray-500">Profit: {entry.score?.toFixed(0)} coins</div>
                </div>
                {i < 3 && <span className="text-xl">{['🥇', '🥈', '🥉'][i]}</span>}
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="glass border border-white/05 rounded-xl p-8 text-center text-gray-500 font-rajdhani">
                Loading leaderboard...
              </div>
            )}
          </div>
        </div>

        {/* Live Feed + Select Player */}
        <div className="space-y-6">
          {/* Player select */}
          <div className="glass-gold rounded-xl p-5 border border-yellow-500/20">
            <h3 className="font-orbitron text-sm font-bold gradient-text-gold mb-4">SELECT PLAYER</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {players.slice(0, 10).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPlayer(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-rajdhani
                    ${currentPlayer?.id === p.id
                      ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
                      : 'glass border border-white/05 text-gray-300 hover:border-yellow-500/20'}`}
                >
                  <span className="font-semibold">{p.username}</span>
                  <span className="text-gray-500 ml-2 text-xs">{p.balance?.toFixed(0)} 🪙</span>
                </button>
              ))}
            </div>
            {currentPlayer && (
              <Link
                to="/games"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-rajdhani font-bold text-black text-sm"
                style={{ background: 'linear-gradient(135deg, #f5c518, #b8960c)' }}
              >
                🎰 Play as {currentPlayer.username}
              </Link>
            )}
          </div>

          {/* Live activity */}
          <div className="glass border border-white/05 rounded-xl p-4">
            <h3 className="font-orbitron text-sm font-bold text-cyan-400 mb-3">⚡ LIVE ACTIVITY</h3>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {recentFeed.length === 0 && (
                <div className="text-gray-600 text-xs font-rajdhani text-center py-4">Waiting for activity...</div>
              )}
              {recentFeed.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-rajdhani animate-slide-in-right">
                  <span>{item.type === 'bigwin' ? '💰' : '🎰'}</span>
                  <span className="text-gray-400">
                    {item.type === 'bigwin'
                      ? <><span className="text-yellow-400">{item.username}</span> won {item.payout?.toFixed(0)} coins!</>
                      : <><span className="text-cyan-400">{item.username || 'Someone'}</span> spun</>
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="border-t border-white/05 py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="font-orbitron text-3xl font-bold text-white mb-4">
            Experience <span className="gradient-text-gold">Adaptive RTP</span>
          </h2>
          <p className="text-gray-400 font-rajdhani mb-8">
            Our casino uses a real-time RTP engine that dynamically adjusts win probability based on losing streak, balance, session duration, and psychological triggers — just like real casinos.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '😰', label: 'Losing Streak', desc: 'Win rate rises' },
              { icon: '🔥', label: 'Hot Streak', desc: 'Win rate falls' },
              { icon: '💀', label: 'Near Broke', desc: 'Sympathy wins' },
              { icon: '🆕', label: 'New Player', desc: 'Rewarding start' },
            ].map((f) => (
              <div key={f.label} className="glass border border-white/05 rounded-xl p-4 card-hover">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="font-rajdhani font-bold text-white text-sm">{f.label}</div>
                <div className="text-gray-500 text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
