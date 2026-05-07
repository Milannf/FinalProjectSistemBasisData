import { useEffect, useState } from 'react';
import { usePlayerStore } from '../store';
import { fetchPlayerStats, fetchPlayerHistory } from '../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Area, AreaChart
} from 'recharts';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-yellow-500/20 px-3 py-2 rounded-lg text-xs font-rajdhani">
      <div className="text-gray-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(0)}</div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { currentPlayer, loadPlayers } = usePlayerStore();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentPlayer) loadPlayers();
  }, []);

  useEffect(() => {
    if (!currentPlayer?.id) return;
    setLoading(true);
    Promise.all([
      fetchPlayerStats(currentPlayer.id),
      fetchPlayerHistory(currentPlayer.id, 100),
    ]).then(([s, h]) => {
      setStats(s);
      setHistory(h);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [currentPlayer?.id]);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-grid">
        <div className="glass border border-yellow-500/20 rounded-2xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="font-orbitron text-xl text-yellow-400 mb-3">No Player Selected</h2>
          <Link to="/" className="glass-gold border border-yellow-500/30 px-6 py-3 rounded-xl font-rajdhani font-bold text-yellow-400">
            ← Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Build chart data from history (reversed = chronological)
  const chartData = [...history].reverse().map((r, i) => ({
    round: i + 1,
    balance: r.resultingBalance,
    bet: r.betAmount,
    payout: r.payout,
    profit: r.payout - r.betAmount,
    winRate: parseFloat((r.winRateUsed * 100).toFixed(1)),
    outcome: r.outcome === 'win' ? 1 : 0,
  }));

  const winCount = history.filter((r) => r.outcome === 'win').length;
  const loseCount = history.length - winCount;
  const totalBet = history.reduce((s, r) => s + r.betAmount, 0);
  const totalPayout = history.reduce((s, r) => s + r.payout, 0);

  return (
    <div className="min-h-screen pt-16 bg-grid">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-3xl font-black gradient-text-gold">ANALYTICS</h1>
            <p className="text-gray-400 font-rajdhani text-sm mt-1">
              Player: <span className="text-yellow-400">{currentPlayer.username}</span>
            </p>
          </div>
          <div className="glass border border-white/05 rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-gray-500 font-rajdhani">Level</div>
            <div className="font-orbitron font-bold text-yellow-400 text-xl">{currentPlayer.level}</div>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Wins" value={currentPlayer.totalWins} icon="✅" color="green" />
          <StatCard label="Total Losses" value={currentPlayer.totalLosses} icon="❌" color="red" />
          <StatCard
            label="Net Profit"
            value={`${currentPlayer.totalProfit?.toFixed(0)} 🪙`}
            icon="💰"
            color={currentPlayer.totalProfit >= 0 ? 'green' : 'red'}
          />
          <StatCard label="Best Win" value={`${currentPlayer.highestSingleWin?.toFixed(0)} 🪙`} icon="🏆" color="gold" />
        </div>

        {loading && (
          <div className="text-center py-10 text-gray-500 font-rajdhani">Loading charts...</div>
        )}

        {chartData.length > 0 && (
          <div className="space-y-6">
            {/* Balance history */}
            <div className="glass border border-white/05 rounded-xl p-6">
              <h3 className="font-orbitron text-sm font-bold text-cyan-400 mb-4">📈 BALANCE HISTORY</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="round" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" stroke="#00f5ff" fill="url(#balGrad)" name="Balance" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Win/Loss bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass border border-white/05 rounded-xl p-6">
                <h3 className="font-orbitron text-sm font-bold text-yellow-400 mb-4">🎯 BET vs PAYOUT</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="round" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bet" fill="#f5c51844" name="Bet" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="payout" fill="#39ff1488" name="Payout" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass border border-white/05 rounded-xl p-6">
                <h3 className="font-orbitron text-sm font-bold text-purple-400 mb-4">🧠 RTP HISTORY</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="round" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="winRate" stroke="#a855f7" name="Win Rate %" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit per round */}
            <div className="glass border border-white/05 rounded-xl p-6">
              <h3 className="font-orbitron text-sm font-bold text-green-400 mb-4">💹 PROFIT PER ROUND</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData.slice(-40)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="round" stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="profit"
                    name="Profit"
                    radius={[2, 2, 0, 0]}
                    fill="#39ff14"
                    // Color bars by positive/negative
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary table */}
            <div className="glass border border-white/05 rounded-xl p-6">
              <h3 className="font-orbitron text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Session Summary (Last {history.length} rounds)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Win Rate', value: `${history.length > 0 ? ((winCount / history.length) * 100).toFixed(1) : 0}%`, color: 'text-green-400' },
                  { label: 'Total Wagered', value: `${totalBet.toFixed(0)} 🪙`, color: 'text-yellow-400' },
                  { label: 'Total Returned', value: `${totalPayout.toFixed(0)} 🪙`, color: 'text-cyan-400' },
                  { label: 'Net Result', value: `${(totalPayout - totalBet).toFixed(0)} 🪙`, color: totalPayout >= totalBet ? 'text-green-400' : 'text-red-400' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`font-orbitron font-bold text-lg ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-500 font-rajdhani">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && chartData.length === 0 && (
          <div className="glass border border-white/05 rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🎰</div>
            <div className="font-rajdhani text-gray-400">No game history yet. Start playing to see analytics!</div>
            <Link to="/casino" className="mt-4 inline-block glass-gold border border-yellow-500/30 px-6 py-2 rounded-xl font-rajdhani font-bold text-yellow-400">
              Play Now →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
