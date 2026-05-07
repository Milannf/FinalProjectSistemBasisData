import { useState, useEffect } from 'react';

export default function Crash({ onBet }) {
  const [gameState, setGameState] = useState('betting'); // betting, running, crashed
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [isBetting, setIsBetting] = useState(false);
  const [betAmount, setBetAmount] = useState(100);

  useEffect(() => {
    if (gameState === 'running') {
      const interval = setInterval(() => {
        setMultiplier(prev => {
          const newMult = prev + 0.05;
          const crashAt = Math.random() * 10 + 1.5;
          
          if (newMult > crashAt) {
            setGameState('crashed');
            setCrashPoint(prev);
            clearInterval(interval);
            return prev;
          }
          return newMult;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  const handleBet = () => {
    if (betAmount <= 0) return;
    setIsBetting(true);
    setGameState('running');
    setMultiplier(1.0);
    setCrashPoint(null);
  };

  const handleCashout = () => {
    if (gameState === 'running') {
      setCrashPoint(multiplier);
      setGameState('crashed');
      setIsBetting(false);

      if (onBet) {
        onBet({
          game: 'crash',
          bet: betAmount,
          cashout: multiplier,
          payout: betAmount * multiplier
        });
      }
    }
  };

  const handleReset = () => {
    setGameState('betting');
    setMultiplier(1.0);
    setCrashPoint(null);
    setIsBetting(false);
  };

  return (
    <div className="glass border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="font-orbitron text-2xl font-bold gradient-text-gold mb-6 text-center">📈 CRASH</h3>
      
      <div className={`rounded-xl p-8 mb-6 text-center transition-all ${
        gameState === 'running' ? 'bg-gradient-to-b from-green-900/40 to-green-900/10 border border-green-500/40' :
        gameState === 'crashed' ? 'bg-gradient-to-b from-red-900/40 to-red-900/10 border border-red-500/40' :
        'bg-white/05 border border-white/10'
      }`}>
        <div className="font-orbitron text-5xl font-black gradient-text-gold">
          {multiplier.toFixed(2)}x
        </div>
        <div className="text-sm text-gray-400 font-rajdhani mt-2">
          {gameState === 'running' ? '📈 MULTIPLIER RISING' : gameState === 'crashed' ? '💥 CRASHED!' : 'READY'}
        </div>
      </div>

      {gameState === 'betting' && (
        <div className="mb-6">
          <label className="block text-sm font-rajdhani text-gray-400 mb-2">Bet Amount</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg bg-white/05 border border-white/10 text-white font-rajdhani"
            min="1"
          />
        </div>
      )}

      <div className="flex gap-3">
        {gameState === 'betting' && (
          <button
            onClick={handleBet}
            className="flex-1 py-3 rounded-xl font-orbitron font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            🎮 BET
          </button>
        )}
        
        {gameState === 'running' && (
          <button
            onClick={handleCashout}
            className="flex-1 py-3 rounded-xl font-orbitron font-bold text-black"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            💰 CASHOUT
          </button>
        )}

        {gameState === 'crashed' && (
          <>
            <div className={`flex-1 py-3 rounded-xl font-rajdhani font-bold text-center ${
              crashPoint >= multiplier ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {crashPoint >= multiplier ? '✅ WIN!' : '❌ LOSS'}
            </div>
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl font-orbitron font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              PLAY AGAIN
            </button>
          </>
        )}
      </div>
    </div>
  );
}
