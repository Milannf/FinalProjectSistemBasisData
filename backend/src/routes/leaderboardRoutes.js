const express = require('express');
const router = express.Router();
const { getLeaderboardData } = require('../controllers/leaderboardController');

router.get('/', getLeaderboardData);

module.exports = router;
