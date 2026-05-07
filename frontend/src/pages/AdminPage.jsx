import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store';
import {
  fetchSystemStats, simulateSpins, forceWinStreak, forceLoseStreak,
  resetRTP, fetchRTPProfile, inspectRedis
} from '../services/api';

export default function AdminPage() {
  const { players, loadPlayers, currentPlayer } = usePlayerStore();
  const [systemStats, setSystemStats] = useState(null);
  const [rtpProfile, setRtpProfile] = useState(null);
  const [redisData, setRedisData] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState({});
  const [streakLength, setStreakLength] = useState(5);
  const [simCount, setSimCount] = useState(100);

  const setLoad = (key, val) => setLoading((l) => ({ ...l, [key]: val }));

  useEffect(() => {
    loadPlayers();
    fetchSystemStats().then(setSystemStats).catch(console.error);
  }, []);

  useEffect(() => {
    if (currentPlayer?.id) {
      fetchRTPProfile(currentPlayer.id).then(setRtpProfile).catch(console.error);
    }
  }, [currentPlayer?.id]);

  const run = async (key, fn) => {
    setLoad(key, true);
    try { await fn(); } catch (e) { alert(e.message); }
    finally { setLoad(key, false); }
  };

  return (
    <div className="min-h-screen pt-16 bg-grid">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl font-black text-red-400 flex items-center gap-3">
            ⚙️ ADMIN DEBUG
          </h1>
          <p className="text-gray-500 font-rajdhani text-sm mt-1">Internal tools — not for players</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Stats */}
          <div className="glass border border-red-500/20 rounded-xl p-6">
            <h2 className="font-orbitron text-sm font-bold text-red-400 mb-4 uppercase tracking-wider">System Stats</h2>
            {systemStats ? (
              <div className="space-y-2 font-rajdhani text-sm">
                {Object.entries(systemStats).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-white/03">
                    <span className="text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-rajdhani text-sm">Loading...</div>
            )}
            <button
              onClick={() => run('stats', () => fetchSystemStats().then(setSystemStats))}
              disabled={loading.stats}
              className="mt-4 w-full py-2 rounded-lg glass border border-red-500/30 text-red-400 font-rajdhani text-sm hover:bg-red-500/10 transition-all"
            >
              {loading.stats ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {/* RTP Inspector */}
          <div className="glass border border-purple-500/20 rounded-xl p-6">
            <h2 className="font-orbitron text-sm font-bold text-purple-400 mb-4 uppercase tracking-wider">
              RTP Profile — {currentPlayer?.username || 'No player selected'}
            </h2>
            {rtpProfile ? (
              <div className="space-y-2 font-rajdhani text-sm">
                {[
                  ['Current Win Rate', `${(rtpProfile.currentWinRate * 100).toFixed(2)}%`],
                  ['Win Modifier', `${(rtpProfile.winModifier * 100).toFixed(2)}%`],
                  ['Losing Streak', rtpProfile.losingStreak],
                  ['Winning Streak', rtpProfile.winningStreak],
                  ['Session Fatigue', `${(rtpProfile.sessionFatigue * 100).toFixed(2)}%`],
                  ['Pity Counter', `${rtpProfile.pityCounter} / 15`],
                  ['Volatility', rtpProfile.volatilityLevel],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-white/03">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-purple-300 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-rajdhani text-sm">Select a player first.</div>
            )}
            {currentPlayer && (
              <button
                onClick={() => run('resetRtp', () => resetRTP(currentPlayer.id).then(() => fetchRTPProfile(currentPlayer.id).then(setRtpProfile)))}
                disabled={loading.resetRtp}
                className="mt-4 w-full py-2 rounded-lg glass border border-purple-500/30 text-purple-400 font-rajdhani text-sm hover:bg-purple-500/10 transition-all"
              >
                {loading.resetRtp ? 'Resetting...' : '🔁 Reset RTP Profile'}
              </button>
            )}
          </div>

          {/* Streak Controls */}
          <div className="glass border border-yellow-500/15 rounded-xl p-6">
            <h2 className="font-orbitron text-sm font-bold text-yellow-400 mb-4 uppercase tracking-wider">Force Streaks</h2>
            <div className="mb-4">
              <label className="text-xs text-gray-400 font-rajdhani mb-1 block">Streak Length</label>
              <input
                type="number"
                value={streakLength}
                onChange={(e) => setStreakLength(parseInt(e.target.value) || 1)}
                className="casino-input"
                min={1}
                max={20}
              />
            </div>
            {!currentPlayer && <div className="text-yellow-500/60 text-xs font-rajdhani mb-3">⚠️ Select a player first</div>}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => run('winStreak', () => forceWinStreak(currentPlayer?.id, streakLength).then(() => fetchRTPProfile(currentPlayer.id).then(setRtpProfile)))}
                disabled={loading.winStreak || !currentPlayer}
                className="py-2.5 rounded-lg glass border border-green-500/30 text-green-400 font-rajdhani font-bold text-sm hover:bg-green-500/10 transition-all"
              >
                {loading.winStreak ? '...' : '🔥 Win Streak'}
              </button>
              <button
                onClick={() => run('loseStreak', () => forceLoseStreak(currentPlayer?.id, streakLength).then(() => fetchRTPProfile(currentPlayer.id).then(setRtpProfile)))}
                disabled={loading.loseStreak || !currentPlayer}
                className="py-2.5 rounded-lg glass border border-red-500/30 text-red-400 font-rajdhani font-bold text-sm hover:bg-red-500/10 transition-all"
              >
                {loading.loseStreak ? '...' : '💔 Lose Streak'}
              </button>
            </div>
          </div>

          {/* Simulate Spins */}
          <div className="glass border border-cyan-500/20 rounded-xl p-6">
            <h2 className="font-orbitron text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">Simulate Spins</h2>
            <div className="mb-4">
              <label className="text-xs text-gray-400 font-rajdhani mb-1 block">Spin Count</label>
              <input
                type="number"
                value={simCount}
                onChange={(e) => setSimCount(Math.min(500, parseInt(e.target.value) || 1))}
                className="casino-input"
                min={1}
                max={500}
              />
            </div>
            <button
              onClick={() => run('sim', () => simulateSpins(currentPlayer?.id, simCount).then(setSimResult))}
              disabled={loading.sim || !currentPlayer}
              className="w-full py-2.5 rounded-lg glass border border-cyan-500/30 text-cyan-400 font-rajdhani font-bold text-sm hover:bg-cyan-500/10 transition-all mb-3"
            >
              {loading.sim ? '⚙️ Simulating...' : `▶️ Run ${simCount} Spins`}
            </button>
            {simResult && (
              <div className="space-y-1.5 font-rajdhani text-sm">
                {[
                  ['Total Spins', simResult.totalSpins],
                  ['Wins', simResult.wins],
                  ['Losses', simResult.losses],
                  ['Actual Win Rate', `${(simResult.actualWinRate * 100).toFixed(2)}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-cyan-300 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Redis Inspector */}
          <div className="glass border border-orange-500/20 rounded-xl p-6 lg:col-span-2">
            <h2 className="font-orbitron text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">Redis Inspector</h2>
            <button
              onClick={() => run('redis', () => inspectRedis().then(setRedisData))}
              disabled={loading.redis}
              className="mb-4 px-5 py-2 rounded-lg glass border border-orange-500/30 text-orange-400 font-rajdhani font-bold text-sm hover:bg-orange-500/10 transition-all"
            >
              {loading.redis ? '⏳ Loading...' : '🔍 Inspect Redis'}
            </button>
            {redisData && (
              <div className="bg-black/30 rounded-xl p-4 max-h-80 overflow-y-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(redisData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
