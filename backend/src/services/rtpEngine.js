/**
 * Dynamic RTP Engine
 * Base win rate: 45%
 * Adaptive modifiers based on player behavior, session state, fatigue, and pity
 */

const RTP_CONFIG = {
  BASE_WIN_RATE: 0.45,
  MIN_WIN_RATE: 0.15,
  MAX_WIN_RATE: 0.75,

  // Losing streak modifiers
  LOSING_STREAK: {
    threshold1: 3,   // +3%
    threshold2: 6,   // +7%
    threshold3: 10,  // +12%
    bonus1: 0.03,
    bonus2: 0.07,
    bonus3: 0.12,
  },

  // Winning streak modifiers (house advantage)
  WINNING_STREAK: {
    threshold1: 3,   // -3%
    threshold2: 5,   // -7%
    threshold3: 8,   // -12%
    penalty1: 0.03,
    penalty2: 0.07,
    penalty3: 0.12,
  },

  // Session fatigue (longer session = worse odds)
  FATIGUE: {
    fatiguePerRound: 0.002,
    maxFatiguePenalty: 0.1,
  },

  // Balance-based sympathy
  SYMPATHY: {
    lowBalanceThreshold: 0.15,  // < 15% of starting 10000 = 1500
    sympathy_bonus: 0.15,
    nearBankruptThreshold: 0.05,
    nearBankrupt_bonus: 0.25,
  },

  // Pity system
  PITY: {
    guaranteedWinAt: 15,    // after 15 losses, force win
    pityBonus: 0.35,
  },

  // Onboarding (new player)
  ONBOARDING: {
    newPlayerRounds: 10,
    newPlayerBonus: 0.12,
  },

  // Volatility multipliers
  VOLATILITY: {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
  },
};

function clampWinRate(rate) {
  return Math.max(RTP_CONFIG.MIN_WIN_RATE, Math.min(RTP_CONFIG.MAX_WIN_RATE, rate));
}

function applyPlayerModifiers(baseRate, rtpProfile) {
  let rate = baseRate;
  const { losingStreak, winningStreak } = rtpProfile;

  // Losing streak boosts
  if (losingStreak >= RTP_CONFIG.LOSING_STREAK.threshold3) {
    rate += RTP_CONFIG.LOSING_STREAK.bonus3;
  } else if (losingStreak >= RTP_CONFIG.LOSING_STREAK.threshold2) {
    rate += RTP_CONFIG.LOSING_STREAK.bonus2;
  } else if (losingStreak >= RTP_CONFIG.LOSING_STREAK.threshold1) {
    rate += RTP_CONFIG.LOSING_STREAK.bonus1;
  }

  // Winning streak penalties
  if (winningStreak >= RTP_CONFIG.WINNING_STREAK.threshold3) {
    rate -= RTP_CONFIG.WINNING_STREAK.penalty3;
  } else if (winningStreak >= RTP_CONFIG.WINNING_STREAK.threshold2) {
    rate -= RTP_CONFIG.WINNING_STREAK.penalty2;
  } else if (winningStreak >= RTP_CONFIG.WINNING_STREAK.threshold1) {
    rate -= RTP_CONFIG.WINNING_STREAK.penalty1;
  }

  // External win modifier (admin override or persistent boost)
  rate += rtpProfile.winModifier || 0;

  return rate;
}

function applySessionModifiers(rate, sessionData) {
  const { totalRounds = 0, isNewPlayer = false } = sessionData;

  // Onboarding bonus
  if (isNewPlayer && totalRounds < RTP_CONFIG.ONBOARDING.newPlayerRounds) {
    rate += RTP_CONFIG.ONBOARDING.newPlayerBonus;
  }

  return rate;
}

function applyFatigueModifiers(rate, rtpProfile, sessionData) {
  const { totalRounds = 0 } = sessionData;
  const fatigue = Math.min(
    totalRounds * RTP_CONFIG.FATIGUE.fatiguePerRound,
    RTP_CONFIG.FATIGUE.maxFatiguePenalty
  );
  return rate - fatigue;
}

function applyPitySystem(rate, rtpProfile) {
  const { pityCounter } = rtpProfile;

  if (pityCounter >= RTP_CONFIG.PITY.guaranteedWinAt) {
    return RTP_CONFIG.PITY.guaranteedWinAt > 0 ? 1.0 : rate; // Force win
  }

  const pityProgress = pityCounter / RTP_CONFIG.PITY.guaranteedWinAt;
  if (pityProgress > 0.7) {
    rate += RTP_CONFIG.PITY.pityBonus * ((pityProgress - 0.7) / 0.3);
  }

  return rate;
}

function applySympathyModifiers(rate, player) {
  const balanceRatio = player.balance / 10000;

  if (balanceRatio <= RTP_CONFIG.SYMPATHY.nearBankruptThreshold) {
    rate += RTP_CONFIG.SYMPATHY.nearBankrupt_bonus;
  } else if (balanceRatio <= RTP_CONFIG.SYMPATHY.lowBalanceThreshold) {
    rate += RTP_CONFIG.SYMPATHY.sympathy_bonus;
  }

  return rate;
}

function calculateWinRate(rtpProfile, sessionData, player) {
  let rate = RTP_CONFIG.BASE_WIN_RATE;

  rate = applyPlayerModifiers(rate, rtpProfile);
  rate = applySessionModifiers(rate, sessionData);
  rate = applyFatigueModifiers(rate, rtpProfile, sessionData);
  rate = applyPitySystem(rate, rtpProfile);
  rate = applySympathyModifiers(rate, player);

  // Apply volatility
  const volatility = RTP_CONFIG.VOLATILITY[rtpProfile.volatilityLevel] || 1.0;
  rate = rate * volatility;

  return clampWinRate(rate);
}

function generateOutcome(winRate) {
  const roll = Math.random();
  const isWin = roll < winRate;

  // Calculate payout multiplier based on win
  let multiplier = 0;
  if (isWin) {
    // Weighted payout distribution
    const payoutRoll = Math.random();
    if (payoutRoll < 0.5) multiplier = 1.5;       // 50% - small win
    else if (payoutRoll < 0.75) multiplier = 2.0;  // 25% - medium win
    else if (payoutRoll < 0.90) multiplier = 3.0;  // 15% - big win
    else if (payoutRoll < 0.97) multiplier = 5.0;  // 7%  - huge win
    else multiplier = 10.0;                         // 3%  - jackpot
  }

  return {
    isWin,
    multiplier,
    roll: parseFloat(roll.toFixed(4)),
    winRateUsed: winRate,
  };
}

module.exports = {
  calculateWinRate,
  generateOutcome,
  applyPlayerModifiers,
  applySessionModifiers,
  applyFatigueModifiers,
  applyPitySystem,
  applySympathyModifiers,
  clampWinRate,
  RTP_CONFIG,
};
