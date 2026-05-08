import { useState } from 'react';
import { usePlayerStore } from '../store';
import SlotReels from '../components/SlotReels';
import Roulette from '../components/Roulette';
import CoinFlip from '../components/CoinFlip';
import DiceRoll from '../components/DiceRoll';
import Crash from '../components/Crash';
import CardDraw from '../components/CardDraw';
import { Link } from 'react-router-dom';

export default function GamesPage() {
  const { currentPlayer, updateBalance } = usePlayerStore();
  const [selectedGame, setSelectedGame] = useState('slots');

  const games = [
    { id: 'slots', name: '🎰 SLOTS', icon: '🎰', component: SlotReels, color: 'from-yellow-600 to-yellow-700' },
    { id: 'roulette', name: '🎡 ROULETTE', icon: '🎡', component: Roulette, color: 'from-purple-600 to-purple-700' },
    { id: 'coinflip', name: '🪙 COIN FLIP', icon: '🪙', component: CoinFlip, color: 'from-cyan-600 to-cyan-700' },
    { id: 'dice', name: '🎲 DICE', icon: '🎲', component: DiceRoll, color: 'from-pink-600 to-pink-700' },
    { id: 'crash', name: '📈 CRASH', icon: '📈', component: Crash, color: 'from-green-600 to-green-700' },
    { id: 'carddraw', name: '🂡 CARDS', icon: '🂡', component: CardDraw, color: 'from-indigo-600 to-indigo-700' },
  ];

  const selectedGameData = games.find(g => g.id === selectedGame);
  const GameComponent = selectedGameData?.component;

  if (!currentPlayer) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-grid">
        <div className="glass border border-yellow-500/20 rounded-2xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-orbitron text-xl text-yellow-400 mb-3">No Player Selected</h2>
          <p className="text-gray-400 font-rajdhani mb-6">Select a player from the Home page to start playing.</p>
          <Link to="/" className="glass-gold border border-yellow-500/30 px-6 py-3 rounded-xl font-rajdhani font-bold text-yellow-400">
            ← Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-grid pt-28 pb-24">
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,197,24,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(0,245,255,0.1),transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="premium-section-heading mb-4">OUR GAMES</div>
          <h1 className="font-orbitron text-5xl md:text-6xl font-black text-white mb-4">Choose your casino challenge</h1>
          <p className="max-w-3xl mx-auto text-gray-400 font-rajdhani text-base md:text-lg">
            Select from high-energy casino games built for premium casino flow and future expansion.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`relative overflow-hidden rounded-[32px] border-2 p-8 text-left transition-all duration-300 ${
                selectedGame === game.id
                  ? `bg-gradient-to-br ${game.color} border-white/30 text-white shadow-[0_30px_80px_rgba(255,214,0,0.16)]`
                  : 'bg-white/5 border-white/10 text-gray-300 hover:border-yellow-500/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl mb-2">{game.icon}</div>
                  <div className="font-orbitron text-2xl font-black tracking-[0.06em]">{game.name}</div>
                </div>
                <div className="text-xs uppercase tracking-[0.35em] text-gray-400">Play</div>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed font-rajdhani">
                {game.id === 'slots' && 'Classic spins, big wins and cinematic reels.'}
                {game.id === 'roulette' && 'Place your bet and chase the red or black wheel.'}
                {game.id === 'coinflip' && 'Heads or tails, fast-paced currency gamble.'}
                {game.id === 'dice' && 'Roll the dice and bet on the total outcome.'}
                {game.id === 'crash' && 'Cash out before the multiplier crashes.'}
                {game.id === 'carddraw' && 'Draw the card and beat the deck.'}
              </div>
            </button>
          ))}
        </div>

        <div className="relative mt-14 glass border border-white/10 rounded-[40px] p-10">
          <h2 className="font-orbitron text-3xl font-black text-white mb-6">Featured game</h2>
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="glass border border-white/10 rounded-[32px] p-8">
              <div className="text-sm uppercase tracking-[0.35em] text-gray-400 mb-4">Live preview</div>
              {GameComponent && (
                <div className="relative rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <GameComponent onBet={(betResult) => { console.log('Bet result:', betResult); }} />
                </div>
              )}
            </div>
            <div className="glass border border-white/10 rounded-[32px] p-8">
              <div className="text-sm uppercase tracking-[0.35em] text-gray-400 mb-4">Quick status</div>
              <div className="space-y-4">
                <div className="pill-card p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Selected game</div>
                  <div className="text-2xl font-orbitron font-black text-yellow-300">{selectedGame.toUpperCase()}</div>
                </div>
                <div className="pill-card p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Balance</div>
                  <div className="text-2xl font-orbitron font-black text-cyan-300">{currentPlayer?.balance?.toFixed(0)} 🪙</div>
                </div>
                <div className="pill-card p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.25em] text-gray-400">Action</div>
                  <div className="text-base text-gray-300 font-semibold">Tap the cards above to switch games instantly.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
