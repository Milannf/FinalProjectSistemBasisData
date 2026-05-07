const prisma = require('../config/prisma');
const { getOrCreateRTPProfile } = require('../services/gameService');
const { invalidateRTPCache } = require('../services/redisService');

const getRTPProfile = async (req, res) => {
  try {
    const { playerId } = req.params;
    const profile = await getOrCreateRTPProfile(playerId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetRTPProfile = async (req, res) => {
  try {
    const { playerId } = req.params;
    const profile = await prisma.rTPProfile.upsert({
      where: { playerId },
      update: {
        currentWinRate: 0.45,
        winModifier: 0,
        losingStreak: 0,
        winningStreak: 0,
        sessionFatigue: 0,
        pityCounter: 0,
        volatilityLevel: 1.0,
      },
      create: { playerId },
    });
    await invalidateRTPCache(playerId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRTPProfile, resetRTPProfile };
