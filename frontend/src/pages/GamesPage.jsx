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
    <div className="min-h-screen pt-20 pb-20 bg-grid">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-orbitron text-4xl font-black gradient-text-gold mb-2">GAMES LOBBY</h1>
            <p className="text-gray-400 font-rajdhani">Playing as <span className="text-yellow-400">{currentPlayer?.username}</span> • Balance: {currentPlayer?.balance?.toFixed(0)} 🪙</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-orbitron font-bold text-yellow-400">{currentPlayer?.balance?.toFixed(0)}</div>
            <div className="text-xs text-gray-500 font-rajdhani">BALANCE</div>
          </div>
        </div>

        {/* Game Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`p-4 rounded-xl font-rajdhani font-bold transition-all transform hover:scale-105 border-2 ${
                selectedGame === game.id
                  ? `bg-gradient-to-b ${game.color} border-white/40 text-white scale-105 shadow-lg shadow-white/20`
                  : 'bg-white/05 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              <div className="text-2xl mb-1">{game.icon}</div>
              <div className="text-xs">{game.name.split(' ')[1]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Display Area */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/05 via-transparent to-transparent rounded-3xl" />
          <div className="relative py-12">
            {GameComponent && (
              <GameComponent 
                onBet={(betResult) => {
                  console.log('Bet result:', betResult);
                  // Handle bet result
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
