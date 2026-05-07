export default function RTPMeter({ winRate = 0.45 }) {
  const pct = Math.round(winRate * 100);
  const color = pct >= 60 ? '#39ff14' : pct >= 45 ? '#f5c518' : pct >= 30 ? '#f97316' : '#ff006e';

  return (
    <div className="glass border border-white/10 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-rajdhani uppercase tracking-wider">RTP Feeling</span>
        <span className="font-orbitron text-sm font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-white/05 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 10px ${color}88`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1 font-rajdhani">
        <span>Cold</span>
        <span>Base</span>
        <span>Hot 🔥</span>
      </div>
    </div>
  );
}
