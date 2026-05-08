import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { usePlayerStore } from '../store';

export default function WelcomePage() {
  const { user } = useAuthStore();
  const { loadPlayerFromAuth } = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.player) {
      loadPlayerFromAuth(user.player);
    }

    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, navigate, loadPlayerFromAuth]);

  const isGuest = user?.guestAccount;
  const displayName = user?.username || 'Player';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />

      <div className="relative z-10 text-center p-8">
        {/* Logo */}
        <div className="mb-8">
          <img src="/logo.png" alt="Jokris99" className="w-32 h-32 mx-auto mb-6 animate-pulse" />
          <div className="text-6xl mb-4">🎉</div>
        </div>

        {/* Welcome message */}
        <div className="glass border border-white/20 rounded-3xl p-12 backdrop-blur-xl max-w-lg mx-auto">
          <h1 className="font-orbitron text-4xl font-black text-white mb-4">
            {isGuest ? 'Welcome Guest!' : 'Welcome Back!'}
          </h1>
          <p className="text-white/90 text-xl font-rajdhani mb-6">
            {isGuest ? `Hello ${displayName}!` : `Welcome back, ${displayName}!`}
          </p>
          <p className="text-white/70 font-rajdhani">
            {isGuest ? 'Enjoy your virtual casino experience!' : 'Ready to continue your gaming session?'}
          </p>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
            <p className="text-white/60 text-sm mt-2 font-rajdhani">Loading your experience...</p>
          </div>
        </div>
      </div>
    </div>
  );
}