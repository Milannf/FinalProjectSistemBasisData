const { getLeaderboard, getWinFeed, getHotStreaks } = require('../services/redisService');
const prisma = require('../config/prisma');

const getLeaderboardData = async (req, res) => {
  try {
    const metric = req.query.metric || 'profit';
    const limit = parseInt(req.query.limit) || 20;

    const entries = await getLeaderboard(metric, limit);

    // Enrich with player usernames
    const playerIds = entries.map((e) => e.playerId);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, username: true, level: true, highestSingleWin: true, totalWins: true, totalLosses: true, totalProfit: true },
    });
    const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));

    const enriched = entries.map((e) => ({
      ...e,
      ...playerMap[e.playerId],
    }));

    const feed = await getWinFeed(10);
    const hotStreaks = await getHotStreaks(5);

    res.json({ leaderboard: enriched, recentWins: feed, hotStreaks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLeaderboardData };
