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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,197,24,0.12),transparent_35%),radial-gradient(circle_at_bottom,_rgba(0,245,255,0.08),transparent_45%)]" />
      </div>

      <section className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center gap-3 glass-gold px-5 py-3 rounded-full mb-8 border border-yellow-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-300 uppercase tracking-[0.35em] font-rajdhani">
              {onlineCount} players online now
            </span>
          </div>

          <h1 className="font-orbitron text-7xl md:text-[5.5rem] lg:text-[6.5rem] font-black tracking-[0.24em] mb-6 leading-tight text-white">
            <span className="gradient-text-gold text-glow-gold">JOKRIS99</span>
          </h1>

          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-4 font-medium">
            Premium virtual casino experience with immersive gameplay, adaptive RTP, and realtime leaderboards.
          </p>
          <p className="text-yellow-300/80 text-sm uppercase tracking-[0.35em] mb-12">
            Virtual coins only • Not real gambling
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/games"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-10 py-4 font-orbitron text-lg uppercase tracking-[0.2em] text-black shadow-[0_20px_80px_rgba(245,197,24,0.25)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="text-2xl">🎰</span>
              PLAY NOW
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center justify-center rounded-full border border-yellow-500/20 bg-white/5 px-10 py-4 text-sm uppercase tracking-[0.2em] text-yellow-300 font-semibold transition-all hover:bg-yellow-500/10"
            >
              LEADERBOARD
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-16">
        <div className="premium-panel rounded-[36px] p-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            {[
              { label: 'Total Players', value: players.length, icon: '👤' },
              { label: 'Online Now', value: onlineCount, icon: '🟢' },
              { label: 'Adaptive RTP', value: 'Dynamic', icon: '🧠' },
              { label: 'Realtime', value: 'Socket.IO', icon: '⚡' },
            ].map((item) => (
              <div key={item.label} className="pill-card p-5 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
                <div className="text-2xl">{item.icon}</div>
                <div className="text-xl font-orbitron font-black text-white">{item.value}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-rajdhani">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
            {[
              { title: 'SLOTS', detail: 'Classic slot machine', icon: '🎰' },
              { title: 'ROULETTE', detail: 'Spin the wheel', icon: '🎡' },
              { title: 'COIN FLIP', detail: 'Heads or tails', icon: '🪙' },
              { title: 'DICE', detail: 'Roll and win', icon: '🎲' },
              { title: 'CARDS', detail: 'Draw and win', icon: '🂡' },
            ].map((game) => (
              <div key={game.title} className="glass border border-white/10 rounded-[28px] p-6 flex flex-col items-center justify-between text-center gap-4 min-h-[250px] hover:border-yellow-500/30 transition-all duration-300">
                <div className="text-5xl mb-2">{game.icon}</div>
                <div>
                  <div className="font-orbitron text-xl font-black text-white mb-2">{game.title}</div>
                  <div className="text-sm text-gray-400 font-rajdhani">{game.detail}</div>
                </div>
                <Link
                  to="/games"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black"
                >
                  PLAY NOW
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
        <div className="premium-panel rounded-[40px] p-10">
          <div className="grid gap-10 xl:grid-cols-[1.45fr_0.95fr] items-start">
            <div className="glass border border-yellow-500/20 rounded-[32px] p-8">
              <div className="flex flex-col gap-3 text-center mb-8">
                <div className="text-sm uppercase tracking-[0.35em] text-yellow-300 font-semibold">Ready to Spin</div>
                <h2 className="font-orbitron text-4xl font-black text-white">Casino floor preview</h2>
                <p className="text-gray-400 font-rajdhani max-w-2xl mx-auto">
                  Explore a larger, centered spin interface built for premium casino flow and cinematic momentum.
                </p>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1 glass border border-white/10 rounded-[32px] p-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">Current balance</div>
                  <div className="text-4xl font-orbitron font-black text-yellow-300">{currentPlayer?.balance?.toLocaleString()} 🪙</div>
                </div>
                <div className="flex-1 glass border border-white/10 rounded-[32px] p-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">Hot streak</div>
                  <div className="text-4xl font-orbitron font-black text-cyan-300">{Math.max(1, Math.floor(players.length / 3))}x</div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
                <Link
                  to="/games"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-10 py-4 text-base font-orbitron font-black uppercase tracking-[0.2em] text-black shadow-[0_25px_80px_rgba(245,197,24,0.18)]"
                >
                  START GAMING
                </Link>
                <div className="text-sm text-gray-400 font-rajdhani uppercase tracking-[0.25em] text-center">
                  Secure • Fair • Transparent
                </div>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-[32px] p-8">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">Session stats</div>
                <div className="grid gap-4 grid-cols-2">
                  <div className="pill-card p-4 text-center">
                    <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Win rate</div>
                    <div className="text-3xl font-orbitron font-black text-yellow-300">57.4%</div>
                  </div>
                  <div className="pill-card p-4 text-center">
                    <div className="text-xs uppercase tracking-[0.25em] text-gray-400">RTP</div>
                    <div className="text-3xl font-orbitron font-black text-cyan-300">57%</div>
                  </div>
                  <div className="pill-card p-4 text-center">
                    <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Win streak</div>
                    <div className="text-3xl font-orbitron font-black text-green-300">3</div>
                  </div>
                  <div className="pill-card p-4 text-center">
                    <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Lose streak</div>
                    <div className="text-3xl font-orbitron font-black text-red-300">1</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">Recent outcomes</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Win</span>
                    <span className="text-green-300">+250.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Lose</span>
                    <span className="text-red-400">-100.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Win</span>
                    <span className="text-green-300">+180.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Win</span>
                    <span className="text-green-300">+300.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>Lose</span>
                    <span className="text-red-400">-100.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
