const prisma = require('../config/prisma');
const { processSpin, getOrCreateRTPProfile } = require('../services/gameService');
const { getSystemStats, getPlayerSession, setPlayerSession } = require('../services/redisService');
const { getRedis } = require('../config/redis');

const simulateSpins = async (req, res) => {
  try {
    const { playerId, count = 100 } = req.body;
    const io = req.app.get('io');

    // Get/create session
    let sessionData = await getPlayerSession(playerId);
    let sessionId = sessionData?.sessionId;
    if (!sessionId) {
      const session = await prisma.gameSession.create({ data: { playerId } });
      sessionId = session.id;
      await setPlayerSession(playerId, { sessionId, startedAt: Date.now() });
    }

    const results = [];
    const spinCount = Math.min(count, 500);

    for (let i = 0; i < spinCount; i++) {
      const player = await prisma.player.findUnique({ where: { id: playerId } });
      if (!player || player.balance < 100) break;
      const result = await processSpin(playerId, 100, sessionId, null); // no socket emit during sim
      results.push(result);
    }

    const wins = results.filter((r) => r.outcome === 'win').length;
    res.json({
      totalSpins: results.length,
      wins,
      losses: results.length - wins,
      actualWinRate: parseFloat((wins / results.length).toFixed(4)),
      lastResult: results[results.length - 1],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSystemStatsAdmin = async (req, res) => {
  try {
    const [stats, playerCount, roundCount] = await Promise.all([
      getSystemStats(),
      prisma.player.count(),
      prisma.gameRound.count(),
    ]);
    res.json({ ...stats, playerCount, totalRounds: roundCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forceWinStreak = async (req, res) => {
  try {
    const { playerId, streakLength = 5 } = req.body;
    await prisma.rTPProfile.upsert({
      where: { playerId },
      update: { winningStreak: streakLength, losingStreak: 0, winModifier: 0.2 },
      create: { playerId, winningStreak: streakLength, losingStreak: 0, winModifier: 0.2 },
    });
    res.json({ success: true, message: `Win streak of ${streakLength} set` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forceLoseStreak = async (req, res) => {
  try {
    const { playerId, streakLength = 5 } = req.body;
    await prisma.rTPProfile.upsert({
      where: { playerId },
      update: { losingStreak: streakLength, winningStreak: 0, winModifier: -0.15 },
      create: { playerId, losingStreak: streakLength, winningStreak: 0, winModifier: -0.15 },
    });
    res.json({ success: true, message: `Lose streak of ${streakLength} set` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const inspectRedis = async (req, res) => {
  try {
    const redis = getRedis();
    const keys = await redis.keys('*');
    const data = {};
    for (const key of keys.slice(0, 50)) {
      const type = await redis.type(key);
      if (type === 'string') data[key] = await redis.get(key);
      else if (type === 'zset') data[key] = await redis.zrevrange(key, 0, 4, 'WITHSCORES');
      else if (type === 'list') data[key] = await redis.lrange(key, 0, 4);
      else if (type === 'set') data[key] = await redis.smembers(key);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { simulateSpins, getSystemStatsAdmin, forceWinStreak, forceLoseStreak, inspectRedis };
