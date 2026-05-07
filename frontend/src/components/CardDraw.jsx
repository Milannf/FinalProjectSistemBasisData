import { useState } from 'react';

export default function CardDraw({ onBet }) {
  const [drawing, setDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [result, setResult] = useState(null);

  const suits = ['♠️', '♥️', '♣️', '♦️'];
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

  const handleDraw = async () => {
    if (!prediction || drawing) return;
    setDrawing(true);

    // Simulate card draw animation
    await new Promise(r => setTimeout(r, 1500));

    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomRank = ranks[Math.floor(Math.random() * ranks.length)];

    let isWin = false;
    if (prediction === 'face' && ['K', 'Q', 'J', 'A'].includes(randomRank)) {
      isWin = true;
    } else if (prediction === 'number' && !['K', 'Q', 'J', 'A'].includes(randomRank)) {
      isWin = true;
    } else if (prediction === 'red' && ['♥️', '♦️'].includes(randomSuit)) {
      isWin = true;
    } else if (prediction === 'black' && ['♠️', '♣️'].includes(randomSuit)) {
      isWin = true;
    }

    setResult({ card: `${randomRank}${randomSuit}`, isWin, prediction });
    setDrawing(false);

    if (onBet) {
      onBet({
        game: 'carddraw',
        bet: prediction,
        result: `${randomRank}${randomSuit}`,
        win: isWin,
        payout: isWin ? 2 : 0
      });
    }
  };

  return (
    <div className="glass border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
      <h3 className="font-orbitron text-2xl font-bold gradient-text-gold mb-6 text-center">🂡 CARD DRAW</h3>

      <div className="flex justify-center mb-8">
        <div className="w-20 h-28 rounded-lg border-2 border-white/30 flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
          <span className="text-6xl">{result ? result.card : '?'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { id: 'face', label: '👑 FACE CARD', color: 'blue' },
          { id: 'number', label: '🔢 NUMBER', color: 'blue' },
          { id: 'red', label: '❤️ RED', color: 'red' },
          { id: 'black', label: '♠️ BLACK', color: 'black' }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setPrediction(opt.id)}
            disabled={drawing}
            className={`py-3 rounded-lg font-rajdhani font-bold text-sm transition-all ${
              prediction === opt.id
                ? 'bg-indigo-600 text-white border-2 border-indigo-400 scale-105'
                : 'bg-white/05 text-gray-400 border border-indigo-500/20 hover:border-indigo-500/40'
            } ${drawing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-lg text-center font-rajdhani font-bold ${
          result.isWin ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-red-500/20 border border-red-500/40 text-red-400'
        }`}>
          {result.isWin ? '✅ WIN!' : '❌ LOSS'} — Drew {result.card}
        </div>
      )}

      <button
        onClick={handleDraw}
        disabled={!prediction || drawing}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-black transition-all"
        style={{
          background: prediction && !drawing ? 'linear-gradient(135deg, #4f46e5, #4338ca)' : '#6b7280',
          cursor: (!prediction || drawing) ? 'not-allowed' : 'pointer'
        }}
      >
        {drawing ? '🂡 DRAWING...' : '🂡 DRAW'}
      </button>
    </div>
  );
}
