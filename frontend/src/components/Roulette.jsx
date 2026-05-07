import { useState } from 'react';

export default function Roulette({ onBet }) {
  const [spinning, setSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [result, setResult] = useState(null);

  const handleSpin = async () => {
    if (!selectedNumber || spinning) return;
    setSpinning(true);
    
    // Simulate spin
    await new Promise(r => setTimeout(r, 2000));
    
    const winNumber = Math.floor(Math.random() * 37);
    const isWin = winNumber === selectedNumber;
    
    setResult({ winNumber, isWin, selectedNumber });
    setSpinning(false);
    
    if (onBet) {
      onBet({ 
        game: 'roulette',
        bet: selectedNumber,
        result: winNumber,
        win: isWin,
        payout: isWin ? 36 : 0
      });
    }
  };

  return (
    <div className="glass border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="font-orbitron text-2xl font-bold gradient-text-gold mb-6 text-center">🎡 ROULETTE</h3>
      
      <div className="bg-gradient-to-b from-purple-900/40 to-purple-900/20 rounded-xl p-6 mb-6 border border-purple-500/20">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 37 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedNumber(i)}
              disabled={spinning}
              className={`w-full py-2 rounded-lg font-rajdhani font-bold text-sm transition-all ${
                selectedNumber === i
                  ? 'bg-purple-600 text-white border border-purple-400 scale-105'
                  : 'bg-white/05 text-gray-400 border border-purple-500/20 hover:border-purple-500/40'
              } ${spinning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-lg text-center font-rajdhani font-bold ${
          result.isWin ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-red-500/20 border border-red-500/40 text-red-400'
        }`}>
          {result.isWin ? '✅ WIN!' : '❌ LOSS'} — Landed on {result.winNumber}
        </div>
      )}

      <button
        onClick={handleSpin}
        disabled={!selectedNumber || spinning}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-black transition-all"
        style={{
          background: selectedNumber && !spinning ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : '#6b7280',
          cursor: (!selectedNumber || spinning) ? 'not-allowed' : 'pointer'
        }}
      >
        {spinning ? '🎡 SPINNING...' : '🎡 SPIN'}
      </button>
    </div>
  );
}
