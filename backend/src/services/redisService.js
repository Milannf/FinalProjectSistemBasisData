const { getRedis } = require('../config/redis');

const KEYS = {
  leaderboard: (metric) => `leaderboard:${metric}`,
  playerSession: (id) => `session:${id}`,
  rtpProfile: (id) => `rtp:${id}`,
  spinCooldown: (id) => `cooldown:${id}`,
  onlineCount: 'online:count',
  onlinePlayers: 'online:players',
  recentWins: 'feed:wins',
  hotStreaks: 'feed:streaks',
  gameState: (id) => `gamestate:${id}`,
};

const COOLDOWN_MS = 1500; // 1.5s between spins
const LEADERBOARD_TTL = 300; // 5 min cache
const RTP_CACHE_TTL = 60;

// ────────────────────────────────────────────────
// Leaderboard
// ────────────────────────────────────────────────

async function updateLeaderboard(playerId, scores) {
  const redis = getRedis();
  const pipeline = redis.pipeline();

  if (scores.totalProfit !== undefined) {
    pipeline.zadd(KEYS.leaderboard('profit'), scores.totalProfit, playerId);
  }
  if (scores.highestSingleWin !== undefined) {
    pipeline.zadd(KEYS.leaderboard('highestWin'), scores.highestSingleWin, playerId);
  }
  if (scores.totalRounds !== undefined) {
    pipeline.zadd(KEYS.leaderboard('mostActive'), scores.totalRounds, playerId);
  }

  await pipeline.exec();
}

async function getLeaderboard(metric = 'profit', limit = 20) {
  const redis = getRedis();
  const key = KEYS.leaderboard(metric);
  // Get top players descending
  const results = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

  const parsed = [];
  for (let i = 0; i < results.length; i += 2) {
    parsed.push({
      playerId: results[i],
      score: parseFloat(results[i + 1]),
      rank: Math.floor(i / 2) + 1,
    });
  }
  return parsed;
}

// ────────────────────────────────────────────────
// Spin cooldown (anti-spam)
// ────────────────────────────────────────────────

async function checkAndSetCooldown(playerId) {
  const redis = getRedis();
  const key = KEYS.spinCooldown(playerId);
  const exists = await redis.get(key);
  if (exists) return false; // on cooldown

  await redis.set(key, '1', 'PX', COOLDOWN_MS);
  return true; // allowed
}

// ────────────────────────────────────────────────
// Session management
// ────────────────────────────────────────────────

async function setPlayerSession(playerId, sessionData) {
  const redis = getRedis();
  await redis.setex(
    KEYS.playerSession(playerId),
    3600, // 1 hour TTL
    JSON.stringify(sessionData)
  );
}

async function getPlayerSession(playerId) {
  const redis = getRedis();
  const data = await redis.get(KEYS.playerSession(playerId));
  return data ? JSON.parse(data) : null;
}

async function deletePlayerSession(playerId) {
  const redis = getRedis();
  await redis.del(KEYS.playerSession(playerId));
}

// ────────────────────────────────────────────────
// Online player counter
// ────────────────────────────────────────────────

async function playerConnected(playerId) {
  const redis = getRedis();
  await redis.sadd(KEYS.onlinePlayers, playerId);
}

async function playerDisconnected(playerId) {
  const redis = getRedis();
  await redis.srem(KEYS.onlinePlayers, playerId);
}

async function getOnlineCount() {
  const redis = getRedis();
  return await redis.scard(KEYS.onlinePlayers);
}

// ────────────────────────────────────────────────
// Recent win feed
// ────────────────────────────────────────────────

async function pushWinFeed(entry) {
  const redis = getRedis();
  const key = KEYS.recentWins;
  await redis.lpush(key, JSON.stringify(entry));
  await redis.ltrim(key, 0, 49); // keep last 50
  await redis.expire(key, 3600);
}

async function getWinFeed(limit = 20) {
  const redis = getRedis();
  const items = await redis.lrange(KEYS.recentWins, 0, limit - 1);
  return items.map((i) => JSON.parse(i));
}

// ────────────────────────────────────────────────
// Hot streak tracking
// ────────────────────────────────────────────────

async function updateHotStreak(playerId, streak) {
  const redis = getRedis();
  await redis.zadd(KEYS.hotStreaks, streak, playerId);
}

async function getHotStreaks(limit = 10) {
  const redis = getRedis();
  const results = await redis.zrevrange(KEYS.hotStreaks, 0, limit - 1, 'WITHSCORES');
  const parsed = [];
  for (let i = 0; i < results.length; i += 2) {
    parsed.push({ playerId: results[i], streak: parseInt(results[i + 1]) });
  }
  return parsed;
}

// ────────────────────────────────────────────────
// RTP cache
// ────────────────────────────────────────────────

async function cacheRTPProfile(playerId, profile) {
  const redis = getRedis();
  await redis.setex(KEYS.rtpProfile(playerId), RTP_CACHE_TTL, JSON.stringify(profile));
}

async function getCachedRTPProfile(playerId) {
  const redis = getRedis();
  const data = await redis.get(KEYS.rtpProfile(playerId));
  return data ? JSON.parse(data) : null;
}

async function invalidateRTPCache(playerId) {
  const redis = getRedis();
  await redis.del(KEYS.rtpProfile(playerId));
}

// ────────────────────────────────────────────────
// System stats
// ────────────────────────────────────────────────

async function getSystemStats() {
  const redis = getRedis();
  const onlineCount = await getOnlineCount();
  const dbSize = await redis.dbsize();
  return { onlineCount, redisKeys: dbSize };
}

module.exports = {
  KEYS,
  updateLeaderboard,
  getLeaderboard,
  checkAndSetCooldown,
  setPlayerSession,
  getPlayerSession,
  deletePlayerSession,
  playerConnected,
  playerDisconnected,
  getOnlineCount,
  pushWinFeed,
  getWinFeed,
  updateHotStreak,
  getHotStreaks,
  cacheRTPProfile,
  getCachedRTPProfile,
  invalidateRTPCache,
  getSystemStats,
};
