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
    <div className="min-h-screen pt-16 bg-grid">
      <Notification notification={notification} />

      {/* Flash overlay */}
      {showFlash && (
        <div
          className={`fixed inset-0 pointer-events-none z-40 transition-opacity duration-300
            ${flashType === 'win' ? 'outcome-win' : 'outcome-lose'}`}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-2xl font-bold gradient-text-gold">CASINO FLOOR</h1>
            <p className="text-gray-500 font-rajdhani text-sm">Playing as {currentPlayer.username}</p>
          </div>
          <div className="glass-gold border border-yellow-500/30 rounded-xl px-6 py-3 text-center">
            <div className="text-xs text-gray-400 font-rajdhani uppercase tracking-wider">Balance</div>
            <div className="font-orbitron font-bold text-2xl text-yellow-400 text-glow-gold">
              {currentPlayer.balance?.toLocaleString(undefined, { maximumFractionDigits: 0 })} 🪙
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main game area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slot machine */}
            <div className="glass border border-yellow-500/15 rounded-2xl p-8 relative overflow-hidden">
              {/* Decorative lines */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-yellow-500/40" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-4 bg-yellow-500/40" />

              <div className="text-center mb-8">
                <div className="text-xs font-rajdhani text-gray-500 uppercase tracking-widest mb-2">SPIN TO WIN</div>
                <div
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-rajdhani font-bold border mb-4
                    ${outcome === 'win' ? 'border-green-500/40 text-green-400 bg-green-500/10' :
                      outcome === 'lose' ? 'border-red-500/40 text-red-400 bg-red-500/10' :
                      'border-white/10 text-gray-400'}`}
                >
                  {outcome === 'win' ? `✅ WIN! +${lastResult?.payout?.toFixed(0)} coins (${lastResult?.multiplier}x)` :
                   outcome === 'lose' ? '❌ No Luck This Time' :
                   isSpinning ? '⏳ Spinning...' : '🎰 Ready to Spin'}
                </div>
              </div>

              {/* Reels */}
              <div className="flex justify-center mb-8">
                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isSpinning ? 'border-yellow-500/60 glow-gold' :
                  outcome === 'win' ? 'border-green-500/60 glow-green' :
                  outcome === 'lose' ? 'border-red-500/30' :
                  'border-white/10'
                }`}>
                  <SlotReels
                    spinning={isSpinning}
                    outcome={outcome}
                    multiplier={lastResult?.multiplier}
                  />
                </div>
              </div>

              {/* Bet controls */}
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap justify-center">
                  {BET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setBetAmount(preset)}
                      className={`px-4 py-2 rounded-lg text-sm font-rajdhani font-semibold transition-all
                        ${betAmount === preset
                          ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                          : 'glass border border-white/08 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400'}`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    onClick={() => setBetAmount(Math.floor(currentPlayer.balance / 2))}
                    className="px-4 py-2 rounded-lg text-sm font-rajdhani font-semibold glass border border-white/08 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400 transition-all"
                  >
                    ½ MAX
                  </button>
                </div>

                <div className="flex gap-3 items-center max-w-sm mx-auto">
                  <input
                    ref={betInputRef}
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="casino-input text-center"
                    min={1}
                    max={currentPlayer.balance}
                  />
                </div>

                {/* SPIN BUTTON */}
                <div className="flex justify-center pt-2">
                  <button
                    id="spin-button"
                    onClick={handleSpin}
                    disabled={isSpinning || betAmount <= 0 || betAmount > currentPlayer.balance}
                    className="spin-btn w-36 h-36 flex items-center justify-center text-black font-orbitron font-black text-xl glow-gold"
                    style={{ background: 'linear-gradient(135deg, #f5c518, #b8960c)' }}
                  >
                    {isSpinning ? (
                      <div className="flex flex-col items-center">
                        <div className="text-3xl animate-rotate-slow">⚙️</div>
                        <span className="text-xs mt-1">SPIN</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-4xl">🎰</span>
                        <span className="text-xs mt-1">SPIN</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Recent outcomes */}
            <div className="glass border border-white/05 rounded-xl p-5">
              <h3 className="font-orbitron text-sm font-bold text-gray-300 mb-4">RECENT OUTCOMES</h3>
              <div className="flex flex-wrap gap-2">
                {localHistory.slice(0, 20).map((r, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-xs font-rajdhani font-semibold border animate-scale-in
                      ${r.outcome === 'win'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                  >
                    {r.outcome === 'win' ? `+${r.payout?.toFixed(0)}` : `-${r.betAmount?.toFixed(0)}`}
                  </div>
                ))}
                {localHistory.length === 0 && (
                  <span className="text-gray-600 text-xs font-rajdhani">No spins yet...</span>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <StatCard
              label="Win Rate (current)"
              value={`${(winRate * 100).toFixed(1)}%`}
              icon="🎯"
              color={winRate >= 0.5 ? 'green' : winRate >= 0.4 ? 'gold' : 'pink'}
            />

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Win Streak 🔥" value={winStreak} color="green" />
              <StatCard label="Lose Streak 💔" value={loseStreak} color="red" />
            </div>

            <StatCard
              label="Pity Counter"
              value={`${rtpProfile?.pityCounter || 0} / 15`}
              icon="🙏"
              color="purple"
              sub="Guaranteed win at 15"
            />

            <RTPMeter winRate={winRate} />

            {/* Player stats */}
            <div className="glass border border-white/05 rounded-xl p-4 space-y-3">
              <h3 className="font-orbitron text-xs font-bold text-gray-400 uppercase tracking-wider">Session Stats</h3>
              {[
                { label: 'Total Wins', value: currentPlayer.totalWins, color: 'text-green-400' },
                { label: 'Total Losses', value: currentPlayer.totalLosses, color: 'text-red-400' },
                { label: 'Total Profit', value: `${currentPlayer.totalProfit?.toFixed(0)} 🪙`, color: currentPlayer.totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
                { label: 'Best Win', value: `${currentPlayer.highestSingleWin?.toFixed(0)} 🪙`, color: 'text-yellow-400' },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-rajdhani">{s.label}</span>
                  <span className={`font-rajdhani font-bold text-sm ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Volatility level */}
            <div className="glass border border-purple-500/20 rounded-xl p-4">
              <div className="text-xs text-gray-400 font-rajdhani uppercase tracking-wider mb-2">Volatility</div>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((v) => (
                  <div
                    key={v}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-rajdhani font-bold text-center capitalize
                      ${rtpProfile?.volatilityLevel === 1.0 && v === 'medium'
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400'
                        : 'glass border border-white/05 text-gray-500'}`}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
