import { useState, useEffect } from 'react';

export default function LoadingScreen({ isLoading }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Complete progress
      setProgress(100);
      
      // Hide after fade out
      setTimeout(() => {
        setIsVisible(false);
      }, 600);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/08 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Loading content */}
      <div className="relative z-10 text-center">
        {/* Logo area */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 flex items-center justify-center animate-pulse">
              <img 
                src="/logo.png" 
                alt="Jokris99" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="text-6xl">🎰</div>';
                }}
              />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/20 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-orbitron text-5xl font-black mb-4 gradient-text-gold">
          JOKRIS99
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 font-rajdhani mb-12 text-sm uppercase tracking-widest">
          Premium Casino Experience
        </p>

        {/* Progress bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden border border-white/20">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 font-rajdhani mt-3">
            {Math.min(Math.round(progress), 100)}%
          </div>
        </div>

        {/* Loading text */}
        <div className="text-gray-500 font-rajdhani text-xs uppercase tracking-wider">
          <span>Initializing</span>
          <span className="inline-block animate-bounce ml-1">.</span>
          <span className="inline-block animate-bounce ml-0.5" style={{ animationDelay: '0.1s' }}>.</span>
          <span className="inline-block animate-bounce ml-0.5" style={{ animationDelay: '0.2s' }}>.</span>
        </div>
      </div>
    </div>
  );
}
