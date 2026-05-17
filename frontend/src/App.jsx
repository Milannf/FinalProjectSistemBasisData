import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar          from './components/Navbar';
import LoadingScreen   from './components/LoadingScreen';
import HomePage        from './pages/HomePage';
import CasinoPage      from './pages/CasinoPage';
import GamesPage       from './pages/GamesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import AdminPage       from './pages/AdminPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import WelcomePage     from './pages/WelcomePage';
import { useSocketEvents } from './hooks/useSocketEvents';
import { usePlayerStore, useAuthStore } from './store';

// ── Guest Banner ──────────────────────────────────────────────────────────────
function GuestBanner() {
  const { logout }          = useAuthStore();
  const navigate            = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [loading,   setLoading]   = useState(false);

  if (dismissed) return null;

  const handleRegister = async () => {
    setLoading(true);
    // Logout dulu  lalu redirect ke register
    await logout();
    navigate('/register');
  };

  return (
    <div style={{
      position:       'sticky',
      top:            '64px',
      zIndex:         40,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            '12px',
      flexWrap:       'wrap',
      padding:        '10px clamp(16px,4vw,40px)',
      background:     'linear-gradient(90deg, rgba(234,179,8,0.15), rgba(249,115,22,0.12), rgba(234,179,8,0.15))',
      borderBottom:   '1px solid rgba(234,179,8,0.25)',
      backdropFilter: 'blur(12px)',
    }}>
      <span style={{ fontSize: '16px' }}>👤</span>

      <span className="font-rajdhani" style={{ color: '#fde047', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
        Kamu bermain sebagai <strong>Guest</strong> — saldo terbatas 5.000 🪙 &amp; data tidak tersimpan setelah logout.
      </span>

      {/* ✅ Button bukan Link — logout dulu, baru navigate */}
      <button
        onClick={handleRegister}
        disabled={loading}
        className="font-orbitron font-bold"
        style={{
          padding:        '6px 18px',
          borderRadius:   '6px',
          fontSize:       '11px',
          letterSpacing:  '0.12em',
          background:     loading ? '#6b7280' : 'linear-gradient(135deg,#f5c518,#f97316)',
          color:          '#000',
          border:         'none',
          cursor:         loading ? 'not-allowed' : 'pointer',
          whiteSpace:     'nowrap',
          flexShrink:     0,
          transition:     'all 0.2s',
        }}
      >
        {loading ? '⏳ Memproses...' : 'REGISTER SEKARANG'}
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        disabled={loading}
        style={{
          background: 'none', border: 'none', color: '#9ca3af',
          fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
          lineHeight: 1, flexShrink: 0, padding: '0 4px',
        }}
        aria-label="Tutup notifikasi"
      >
        ✕
      </button>
    </div>
  );
}

// ── App Inner ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { currentPlayer, loadPlayers }      = usePlayerStore();
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const [isLoading, setIsLoading]           = useState(true);
  useSocketEvents(currentPlayer?.id);

  const isGuest = user?.guestAccount === true;

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      loadPlayers();
      setIsLoading(false);
    };
    init();
  }, []);

  if (!isAuthenticated && !isLoading) {
    return (
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} />

      {/* Video background */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" src="/background1.mp4" />
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-25" src="/background2.mp4" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,197,24,0.12),transparent_35%),radial-gradient(circle_at_bottom,_rgba(0,245,255,0.08),transparent_45%)] pointer-events-none" />
      </div>

      <div className="relative min-h-screen" style={{ background: 'transparent' }}>
        <Navbar />

        {/* Banner hanya muncul untuk guest */}
        {isGuest && <GuestBanner />}

        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/casino"      element={<CasinoPage />} />
          <Route path="/games"       element={<GamesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/analytics"   element={<AnalyticsPage />} />
          <Route path="/admin"       element={<AdminPage />} />
          <Route path="/welcome"     element={<WelcomePage />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}