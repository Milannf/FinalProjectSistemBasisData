import { useEffect, useState } from 'react';
import { useLeaderboardStore } from '../store';
import { fetchLeaderboard } from '../services/api';

const METRICS = [
  { key: 'profit', label: 'Top Profit', icon: '💰' },
  { key: 'highestWin', label: 'Biggest Win', icon: '🎯' },
  { key: 'mostActive', label: 'Most Active', icon: '🔥' },
];

export default function LeaderboardPage() {
  const { leaderboard, recentWins, setLeaderboard, setRecentWins, metric, setMetric } = useLeaderboardStore();
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = async (m) => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(m);
      if (data?.leaderboard) setLeaderboard(data.leaderboard);
      if (data?.recentWins) setRecentWins(data.recentWins);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(metric);
    const interval = setInterval(() => loadLeaderboard(metric), 10000);
    return () => clearInterval(interval);
  }, [metric]);

  const formatScore = (score, m) => {
    if (m === 'mostActive') return `${score?.toFixed(0)} rounds`;
    return `${score?.toFixed(0)} 🪙`;
  };

  return (
    <div className="min-h-screen pt-16 bg-grid">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-orbitron text-4xl font-black gradient-text-gold text-glow-gold mb-2">
            🏆 LEADERBOARD
          </h1>
          <p className="text-gray-400 font-rajdhani">Realtime rankings — updates every 10 seconds</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-rajdhani">LIVE</span>
          </div>
        </div>

        {/* Metric tabs */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-5 py-2.5 rounded-xl font-rajdhani font-bold text-sm transition-all flex items-center gap-2
                ${metric === m.key
                  ? 'glass-gold border border-yellow-500/40 text-yellow-400 glow-gold'
                  : 'glass border border-white/08 text-gray-400 hover:border-yellow-500/20 hover:text-yellow-400'}`}
            >
              <span>{m.icon}</span> {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main leaderboard */}
          <div className="lg:col-span-2">
            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, displayIdx) => {
                  const rank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
                  const actualEntry = entry;
                  return (
                    <div
                      key={actualEntry?.playerId}
                      className={`glass border rounded-xl p-4 text-center card-hover flex flex-col items-center
                        ${rank === 1 ? 'border-yellow-400/40 glow-gold row-start-1' :
                          rank === 2 ? 'border-gray-400/30' :
                          'border-amber-700/30'}`}
                      style={rank === 1 ? { marginTop: 0 } : { marginTop: '1.5rem' }}
                    >
                      <div className="text-3xl mb-1">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
                      <div className="font-rajdhani font-bold text-white text-sm">{actualEntry?.username || 'Player'}</div>
                      <div className={`font-orbitron font-bold text-xs mt-1
                        ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600'}`}>
                        {formatScore(actualEntry?.score, metric)}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-bold text-sm mt-2
                        ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : 'rank-3'}`}>
                        {rank}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="space-y-2">
              {loading && leaderboard.length === 0 && (
                <div className="glass border border-white/05 rounded-xl p-8 text-center text-gray-500 font-rajdhani">
                  Loading...
                </div>
              )}
              {leaderboard.slice(3).map((entry, i) => (
                <div
                  key={entry.playerId || i}
                  className="glass border border-white/05 rounded-xl p-4 flex items-center gap-4 card-hover animate-slide-up"
                >
                  <div className="w-8 h-8 rounded-full bg-white/08 flex items-center justify-center font-orbitron text-sm text-gray-400 font-bold">
                    {i + 4}
                  </div>
                  <div className="flex-1">
                    <div className="font-rajdhani font-bold text-white">{entry.username || 'Player'}</div>
                    <div className="text-xs text-gray-500">
                      Wins: {entry.totalWins || '—'} | Losses: {entry.totalLosses || '—'}
                    </div>
                  </div>
                  <div className="font-orbitron font-bold text-yellow-400 text-sm">
                    {formatScore(entry.score, metric)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent big wins */}
            <div className="glass border border-yellow-500/15 rounded-xl p-5">
              <h3 className="font-orbitron text-sm font-bold gradient-text-gold mb-4">💰 RECENT WINS</h3>
              <div className="space-y-2">
                {recentWins.length === 0 && (
                  <div className="text-gray-600 text-xs font-rajdhani text-center py-2">No wins yet</div>
                )}
                {recentWins.map((win, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/03">
                    <div>
                      <div className="text-sm font-rajdhani font-bold text-white">{win.username}</div>
                      <div className="text-xs text-gray-500">{win.multiplier}x multiplier</div>
                    </div>
                    <div className="text-green-400 font-rajdhani font-bold text-sm">
                      +{win.payout?.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="glass border border-white/05 rounded-xl p-4">
              <h3 className="font-orbitron text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Ranking System</h3>
              <div className="space-y-2 text-xs font-rajdhani text-gray-500">
                <div>💰 <span className="text-white">Top Profit</span> — Net coins earned</div>
                <div>🎯 <span className="text-white">Biggest Win</span> — Single highest payout</div>
                <div>🔥 <span className="text-white">Most Active</span> — Total rounds played</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
