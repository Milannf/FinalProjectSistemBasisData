import { useState, useEffect, useRef } from 'react';
import { usePlayerStore, useGameStore } from '../store';
import { spinGame, fetchRTPProfile } from '../services/api';
import SlotReels from '../components/SlotReels';
import RTPMeter from '../components/RTPMeter';
import Notification from '../components/Notification';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';

const BET_PRESETS = [50, 100, 250, 500, 1000];

export default function CasinoPage() {
  const { currentPlayer, updateBalance, loadPlayers } = usePlayerStore();
  const { isSpinning, setSpinning, lastResult, addResult, notification, setNotification } = useGameStore();

  const [betAmount, setBetAmount] = useState(100);
  const [rtpProfile, setRtpProfile] = useState(null);
  const [localHistory, setLocalHistory] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [flashType, setFlashType] = useState('');
  const betInputRef = useRef(null);

  useEffect(() => {
    if (!currentPlayer) loadPlayers();
  }, []);

  useEffect(() => {
    if (currentPlayer?.id) {
      fetchRTPProfile(currentPlayer.id).then(setRtpProfile).catch(() => {});
    }
  }, [currentPlayer?.id]);

  const handleSpin = async () => {
    if (!currentPlayer) return;
    if (isSpinning) return;
    if (betAmount <= 0 || betAmount > currentPlayer.balance) return;

    setSpinning(true);
    setOutcome(null);

    try {
      const result = await spinGame(currentPlayer.id, betAmount);

      // Animate reels for ~1.8s
      await new Promise((r) => setTimeout(r, 1800));

      setOutcome(result.outcome);
      setSpinning(false);

      // Flash effect
      setFlashType(result.outcome);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 800);

      updateBalance(result.newBalance);
      addResult(result);
      setLocalHistory((prev) => [result, ...prev].slice(0, 20));

      if (result.isBigWin) {
        setNotification({ type: 'bigwin', message: `💰 BIG WIN! +${result.payout.toFixed(0)} coins! (${result.multiplier}x)` });
      } else if (result.outcome === 'win') {
        setNotification({ type: 'win', message: `✅ WIN! +${result.payout.toFixed(0)} coins` });
      }

      // Refresh RTP
      fetchRTPProfile(currentPlayer.id).then(setRtpProfile).catch(() => {});
    } catch (err) {
      setSpinning(false);
      setNotification({ type: 'error', message: err.message });
    }
  };

  const winRate = rtpProfile?.currentWinRate || 0.45;
  const winStreak = rtpProfile?.winningStreak || 0;
  const loseStreak = rtpProfile?.losingStreak || 0;

  if (!currentPlayer) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-grid">
        <div className="glass border border-yellow-500/20 rounded-2xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎰</div>
          <h2 className="font-orbitron text-xl text-yellow-400 mb-3">No Player Selected</h2>
          <p className="text-gray-400 font-rajdhani mb-6">Select a player from the Home page to start playing.</p>
          <Link to="/" className="glass-gold border border-yellow-500/30 px-6 py-3 rounded-xl font-rajdhani font-bold text-yellow-400">
            ← Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-grid pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,197,24,0.12),transparent_35%),radial-gradient(circle_at_bottom,_rgba(0,245,255,0.08),transparent_45%)]" />

      <div className="relative z-10">
        <Notification notification={notification} />

        {showFlash && (
          <div
            className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-300 ${flashType === 'win' ? 'outcome-win' : 'outcome-lose'}`}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="glass border border-white/10 rounded-[40px] p-10">
            <div className="flex flex-col xl:flex-row items-start justify-between gap-6 mb-10">
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-yellow-300 font-semibold mb-2">Casino floor</div>
                <h1 className="font-orbitron text-5xl lg:text-6xl font-black text-white leading-tight">Premium spin suite</h1>
                <p className="text-gray-400 font-rajdhani mt-4 max-w-2xl">Big casino energy with a larger, centered spin section and premium HUD layout.</p>
              </div>
              <div className="glass-gold border border-yellow-500/30 rounded-[28px] px-6 py-5 text-center min-w-[220px]">
                <div className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Balance</div>
                <div className="font-orbitron text-4xl font-black text-yellow-300 text-glow-gold">{currentPlayer.balance?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙</div>
              </div>
            </div>

            <div className="grid gap-10 xl:grid-cols-[1.6fr_1fr]">
              <div className="glass border border-yellow-500/15 rounded-[32px] p-8">
                <div className="text-center mb-8">
                  <div className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-3">Spin to win</div>
                  <div className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ${
                    outcome === 'win'
                      ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                      : outcome === 'lose'
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                      : 'bg-white/10 text-gray-300 border border-white/15'
                  }`}>
                    {outcome === 'win'
                      ? `✅ WIN! +${lastResult?.payout?.toFixed(0)} coins (${lastResult?.multiplier}x)`
                      : outcome === 'lose'
                      ? '❌ No Luck This Time'
                      : isSpinning
                      ? '⏳ Spinning...'
                      : '🎰 Ready to Spin'}
                  </div>
                </div>

                <div className="flex justify-center mb-10">
                  <div className={`rounded-[32px] p-4 border-2 transition-all duration-300 ${
                    isSpinning ? 'border-yellow-500/60 glow-gold' : outcome === 'win' ? 'border-green-500/60 glow-green' : outcome === 'lose' ? 'border-red-500/30' : 'border-white/10'
                  }`}>
                    <SlotReels spinning={isSpinning} outcome={outcome} multiplier={lastResult?.multiplier} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {BET_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setBetAmount(preset)}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                          betAmount === preset
                            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:border-yellow-500/30 hover:text-yellow-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                    <button
                      onClick={() => setBetAmount(Math.floor(currentPlayer.balance / 2))}
                      className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:border-yellow-500/30 hover:text-yellow-200 transition-all"
                    >
                      ½ MAX
                    </button>
                  </div>

                  <div className="max-w-md mx-auto">
                    <input
                      ref={betInputRef}
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="casino-input text-center text-xl"
                      min={1}
                      max={currentPlayer.balance}
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      id="spin-button"
                      onClick={handleSpin}
                      disabled={isSpinning || betAmount <= 0 || betAmount > currentPlayer.balance}
                      className="spin-btn w-44 h-44 flex items-center justify-center text-black font-orbitron font-black text-2xl glow-gold"
                      style={{ background: 'linear-gradient(135deg, #f5c518, #b8960c)' }}
                    >
                      {isSpinning ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-4xl animate-rotate-slow">⚙️</div>
                          <span className="text-sm uppercase tracking-[0.2em]">SPIN</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-5xl">🎰</span>
                          <span className="text-sm uppercase tracking-[0.2em]">SPIN</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass border border-white/10 rounded-[32px] p-6">
                  <div className="text-sm uppercase tracking-[0.35em] text-gray-400 mb-5">Session stats</div>
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
                      <div className="text-3xl font-orbitron font-black text-green-300">{Math.max(0, currentPlayer?.balance ? Math.floor(currentPlayer.balance / 1000) : 1)}</div>
                    </div>
                    <div className="pill-card p-4 text-center">
                      <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Lose streak</div>
                      <div className="text-3xl font-orbitron font-black text-red-300">1</div>
                    </div>
                  </div>
                </div>

                <div className="glass border border-white/10 rounded-[32px] p-6">
                  <div className="text-sm uppercase tracking-[0.35em] text-gray-400 mb-5">Recent outcomes</div>
                  <div className="space-y-3">
                    {localHistory.slice(0, 5).map((r, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                        <span>{r.outcome === 'win' ? 'Win' : 'Loss'}</span>
                        <span className={r.outcome === 'win' ? 'text-green-300' : 'text-red-300'}>
                          {r.outcome === 'win' ? `+${r.payout?.toFixed(0)}` : `-${r.betAmount?.toFixed(0)}`}
                        </span>
                      </div>
                    ))}
                    {!localHistory.length && (
                      <div className="text-center text-gray-500 text-sm">No recent outcomes yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
