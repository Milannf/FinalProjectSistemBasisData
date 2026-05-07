import { useEffect } from 'react';

export default function Notification({ notification }) {
  if (!notification) return null;

  const isBigWin = notification.type === 'bigwin';

  return (
    <div
      className={`fixed top-20 right-4 z-50 glass border rounded-xl px-5 py-4 toast max-w-xs
        ${isBigWin ? 'border-yellow-400/60 glow-gold' : 'border-white/10'}`}
    >
      <div className={`font-rajdhani font-bold text-lg ${isBigWin ? 'gradient-text-gold text-glow-gold' : 'text-white'}`}>
        {notification.message}
      </div>
    </div>
  );
}
