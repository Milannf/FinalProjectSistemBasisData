import { useState } from 'react';

export default function CoinFlip({ onBet }) {
  const [spinning, setSpinning] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const handleFlip = async () => {
    if (!prediction || spinning) return;
    setSpinning(true);

    // Animate flip
    const finalRotation = (Math.random() > 0.5 ? 1 : 0) * 180;
    for (let i = 0; i < 20; i++) {
      setRotation(prev => prev + Math.random() * 360);
      await new Promise(r => setTimeout(r, 50));
    }
    
    setRotation(finalRotation);
    const isHeads = finalRotation % 360 < 180;
    const isWin = (isHeads && prediction === 'heads') || (!isHeads && prediction === 'tails');
    
    await new Promise(r => setTimeout(r, 500));
    setResult({ side: isHeads ? 'heads' : 'tails', isWin, prediction });
    setSpinning(false);

    if (onBet) {
      onBet({
        game: 'coinflip',
        bet: prediction,
        result: isHeads ? 'heads' : 'tails',
        win: isWin,
        payout: isWin ? 2 : 0
      });
    }
  };

  return (
    <div className="glass border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="font-orbitron text-2xl font-bold gradient-text-gold mb-6 text-center">🪙 COIN FLIP</h3>
      
      <div className="flex justify-center mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-transform duration-100 border-4 border-yellow-500/40"
          style={{
            transform: `rotateY(${rotation}deg)`,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            transformStyle: 'preserve-3d'
          }}
        >
          {rotation % 360 < 180 ? '🪙' : '⭕'}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { id: 'heads', label: '🪙 HEADS', icon: '🪙' },
          { id: 'tails', label: '⭕ TAILS', icon: '⭕' }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setPrediction(opt.id)}
            disabled={spinning}
            className={`flex-1 py-3 rounded-xl font-rajdhani font-bold transition-all ${
              prediction === opt.id
                ? 'bg-cyan-600 text-white border border-cyan-400 scale-105'
                : 'bg-white/05 text-gray-400 border border-cyan-500/20 hover:border-cyan-500/40'
            } ${spinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-lg text-center font-rajdhani font-bold ${
          result.isWin ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-red-500/20 border border-red-500/40 text-red-400'
        }`}>
          {result.isWin ? '✅ WIN!' : '❌ LOSS'} — {result.side.toUpperCase()}
        </div>
      )}

      <button
        onClick={handleFlip}
        disabled={!prediction || spinning}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-black transition-all"
        style={{
          background: prediction && !spinning ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : '#6b7280',
          cursor: (!prediction || spinning) ? 'not-allowed' : 'pointer'
        }}
      >
        {spinning ? '🪙 FLIPPING...' : '🪙 FLIP'}
      </button>
    </div>
  );
}
