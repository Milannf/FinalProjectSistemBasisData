import { useEffect, useRef, useState } from 'react';

const SYMBOLS       = ['🍒', '💎', '🍋', '⭐', '🔔', '🃏', '🍀', '🌙', '🔥', '💰'];
const REEL_DELAY_MS = 1500;

function Reel({ spinning, finalSymbol, delay = 0 }) {
  const [displaySymbol, setDisplaySymbol] = useState('🎰');
  const [isStopped,     setIsStopped]     = useState(false);

  const intervalRef    = useRef(null);
  const stopTimerRef   = useRef(null);
  const finalSymbolRef = useRef(finalSymbol);

  // Sync ref ke prop terbaru tanpa trigger re-render
  useEffect(() => {
    finalSymbolRef.current = finalSymbol;
  });

  useEffect(() => {
    if (spinning) {
      clearTimeout(stopTimerRef.current);  // batalkan stop yg pending
      stopTimerRef.current = null;

      clearInterval(intervalRef.current);  // bersihkan interval lama
      setIsStopped(false);

      let i = 0;
      intervalRef.current = setInterval(() => {
        setDisplaySymbol(SYMBOLS[i % SYMBOLS.length]);
        i++;
      }, 80);

      return () => {
        clearTimeout(stopTimerRef.current);
      };

    } else {
      stopTimerRef.current = setTimeout(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        const sym = finalSymbolRef.current
          ?? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        setDisplaySymbol(sym);
        setIsStopped(true);
      }, delay);

      return () => {
        clearTimeout(stopTimerRef.current);
      };
    }
  }, [spinning, delay]); // finalSymbol 

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(stopTimerRef.current);
    };
  }, []);

  return (
    <div
      className="reel-container w-24 h-24 glass border rounded-xl flex items-center justify-center transition-all duration-300"
      style={{
        borderColor: isStopped ? 'rgba(245,197,24,0.55)' : 'rgba(245,197,24,0.2)',
        boxShadow:   isStopped ? '0 0 18px rgba(245,197,24,0.35)' : 'none',
      }}
    >
      <span
        className="text-5xl select-none"
        style={{
          filter:     isStopped ? 'none' : 'blur(2px)',
          transform:  isStopped ? 'scale(1)' : 'scale(1.1)',
          transition: 'filter 0.25s, transform 0.25s',
        }}
      >
        {displaySymbol}
      </span>
    </div>
  );
}

export default function SlotReels({ spinning, reelSymbols = [null, null, null] }) {
  return (
    <div className="flex gap-3 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <Reel
          key={i}
          spinning={spinning}
          finalSymbol={reelSymbols[i]}
          delay={i * REEL_DELAY_MS}   // Reel 1: 0ms | Reel 2: 1500ms | Reel 3: 3000ms
        />
      ))}
    </div>
  );
}