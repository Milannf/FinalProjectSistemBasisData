export default function StatCard({ label, value, icon, color = 'gold', sub }) {
  const colorMap = {
    gold: 'border-yellow-500/20 text-yellow-400',
    cyan: 'border-cyan-500/20 text-cyan-400',
    purple: 'border-purple-500/20 text-purple-400',
    green: 'border-green-500/20 text-green-400',
    pink: 'border-pink-500/20 text-pink-400',
    red: 'border-red-500/20 text-red-400',
  };

  return (
    <div className={`glass border ${colorMap[color]} rounded-xl p-4 card-hover`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs font-rajdhani uppercase tracking-wider">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className={`font-orbitron font-bold text-xl ${colorMap[color].split(' ')[1]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1 font-rajdhani">{sub}</div>}
    </div>
  );
}
