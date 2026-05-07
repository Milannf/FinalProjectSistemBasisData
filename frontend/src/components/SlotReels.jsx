import { useEffect, useRef, useState } from 'react';

const SYMBOLS = ['🍒', '💎', '🍋', '⭐', '🔔', '🃏', '🍀', '🌙', '🔥', '💰'];

function Reel({ spinning, finalSymbol, delay = 0 }) {
  const [displaySymbol, setDisplaySymbol] = useState('🎰');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      let i = 0;
      intervalRef.current = setInterval(() => {
        setDisplaySymbol(SYMBOLS[i % SYMBOLS.length]);
        i++;
      }, 80);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => {
        setDisplaySymbol(finalSymbol || SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
      }, delay);
    }
    return () => clearInterval(intervalRef.current);
  }, [spinning, finalSymbol, delay]);

  return (
    <div className="reel-container w-24 h-24 glass border border-yellow-500/20 rounded-xl flex items-center justify-center">
      <span
        className={`text-5xl select-none transition-all duration-200 ${spinning ? 'blur-sm scale-110' : 'blur-0 scale-100'}`}
        style={{ filter: spinning ? 'blur(2px)' : 'none' }}
      >
        {displaySymbol}
      </span>
    </div>
  );
}

export default function SlotReels({ spinning, outcome, multiplier }) {
  const getSymbols = () => {
    if (!outcome) return [null, null, null];
    if (outcome === 'win') {
      if (multiplier >= 10) return ['💎', '💎', '💎'];
      if (multiplier >= 5) return ['⭐', '⭐', '⭐'];
      if (multiplier >= 3) return ['🔔', '🔔', '🔔'];
      const s = SYMBOLS[Math.floor(Math.random() * 5)];
      return [s, s, SYMBOLS[Math.floor(Math.random() * 5)]]; // 2 match for small win look
    }
    // Lose - all different
    const used = new Set();
    return [0, 1, 2].map(() => {
      let s;
      do { s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; } while (used.has(s));
      used.add(s);
      return s;
    });
  };

  const [symbols, setSymbols] = useState([null, null, null]);

  useEffect(() => {
    if (!spinning && outcome) {
      setSymbols(getSymbols());
    }
  }, [spinning, outcome]);

  return (
    <div className="flex gap-3 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <Reel key={i} spinning={spinning} finalSymbol={symbols[i]} delay={i * 200} />
      ))}
    </div>
  );
}
