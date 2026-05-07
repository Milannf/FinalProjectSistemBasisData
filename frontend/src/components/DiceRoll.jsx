import { useState } from 'react';

export default function DiceRoll({ onBet }) {
  const [rolling, setRolling] = useState(false);
  const [predictions, setPredictions] = useState({});
  const [result, setResult] = useState(null);

  const handleRoll = async () => {
    const hasSelection = Object.values(predictions).some(v => v);
    if (!hasSelection || rolling) return;
    
    setRolling(true);
    
    // Animate dice
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 50));
    }
    
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    
    const isWin = 
      (predictions.low && total <= 7) ||
      (predictions.high && total >= 8) ||
      (predictions.lucky7 && total === 7) ||
      (predictions.snake && total === 2) ||
      (predictions.boxcars && total === 12);
    
    setResult({ dice1, dice2, total, isWin });
    setRolling(false);

    if (onBet) {
      onBet({
        game: 'dice',
        bet: Object.keys(predictions).filter(k => predictions[k]),
        result: total,
        win: isWin,
        payout: isWin ? 2 : 0
      });
    }
  };

  const options = [
    { id: 'low', label: '🔽 LOW (2-7)', color: 'blue' },
    { id: 'high', label: '🔼 HIGH (8-12)', color: 'red' },
    { id: 'lucky7', label: '7️⃣ LUCKY 7', color: 'gold', special: true },
    { id: 'snake', label: '🐍 SNAKE EYES', color: 'purple', special: true },
    { id: 'boxcars', label: '🚗 BOXCARS', color: 'purple', special: true },
  ];

  return (
    <div className="glass border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="font-orbitron text-2xl font-bold gradient-text-gold mb-6 text-center">🎲 DICE ROLL</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => setPredictions(p => ({ ...p, [opt.id]: !p[opt.id] }))}
            disabled={rolling}
            className={`py-3 px-2 rounded-lg font-rajdhani font-bold text-sm transition-all ${
              predictions[opt.id]
                ? opt.special ? 'bg-yellow-600 text-white border-2 border-yellow-400' : 'bg-white/15 text-white border-2 border-white/40'
                : 'bg-white/05 text-gray-400 border border-white/10 hover:border-white/20'
            } ${rolling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-lg text-center font-rajdhani font-bold ${
          result.isWin ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-red-500/20 border border-red-500/40 text-red-400'
        }`}>
          <div className="text-3xl mb-2">{result.dice1} 🎲 {result.dice2}</div>
          <div>{result.isWin ? '✅ WIN!' : '❌ LOSS'} — Total: {result.total}</div>
        </div>
      )}

      <button
        onClick={handleRoll}
        disabled={!Object.values(predictions).some(v => v) || rolling}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-black transition-all"
        style={{
          background: Object.values(predictions).some(v => v) && !rolling ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#6b7280',
          cursor: (!Object.values(predictions).some(v => v) || rolling) ? 'not-allowed' : 'pointer'
        }}
      >
        {rolling ? '🎲 ROLLING...' : '🎲 ROLL'}
      </button>
    </div>
  );
}
