import { useEffect } from 'react';
import { getSocket } from '../socket/socketClient';
import { useLeaderboardStore, useSystemStore, useGameStore } from '../store';

export function useSocketEvents(playerId) {
  const { setLeaderboard, setRecentWins } = useLeaderboardStore();
  const { setOnlineCount, addFeedItem }   = useSystemStore();
  const { addResult }                     = useGameStore();

  useEffect(() => {
    if (!playerId) return;
    const socket = getSocket(playerId);

    socket.on('leaderboard:update', (data) => setLeaderboard(data));
    socket.on('feed:recentWins',    (data) => setRecentWins(data));
    socket.on('system:onlineCount', ({ count }) => setOnlineCount(count));

    socket.on('player:win', (result) => {
      addResult(result);
    });

    socket.on('player:lose', (result) => {
      addResult(result);
    });

    socket.on('system:bigWin', ({ username, payout }) => {
      addFeedItem({ type: 'bigwin', username, payout, timestamp: Date.now() });
    });

    socket.on('player:spin', (data) => {
      addFeedItem({ type: 'spin', ...data, timestamp: Date.now() });
    });

    return () => {
      socket.off('leaderboard:update');
      socket.off('feed:recentWins');
      socket.off('system:onlineCount');
      socket.off('player:win');
      socket.off('player:lose');
      socket.off('system:bigWin');
      socket.off('player:spin');
    };
  }, [playerId]);
}