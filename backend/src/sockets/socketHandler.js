const { getLeaderboard, getWinFeed, getOnlineCount, playerConnected, playerDisconnected } = require('../services/redisService');
const prisma = require('../config/prisma');

function initSockets(io) {
  io.on('connection', async (socket) => {
    const playerId = socket.handshake.query.playerId;
    console.log(`[Socket] Connected: ${socket.id} player=${playerId}`);

    if (playerId) {
      socket.join(`player:${playerId}`);
      await playerConnected(playerId);
    }

    const onlineCount = await getOnlineCount();
    io.emit('system:onlineCount', { count: onlineCount });

    // Send initial leaderboard on connect
    try {
      const lb = await getLeaderboard('profit', 10);
      const playerIds = lb.map((e) => e.playerId);
      const players = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        select: { id: true, username: true, totalProfit: true, highestSingleWin: true },
      });
      const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));
      socket.emit('leaderboard:update', lb.map((e) => ({ ...e, ...playerMap[e.playerId] })));

      const feed = await getWinFeed(10);
      socket.emit('feed:recentWins', feed);
    } catch (e) {
      console.error('[Socket] Init error:', e.message);
    }

    socket.on('disconnect', async () => {
      if (playerId) {
        await playerDisconnected(playerId);
        const count = await getOnlineCount();
        io.emit('system:onlineCount', { count });
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initSockets };
