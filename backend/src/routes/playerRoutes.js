const express = require('express');
const router = express.Router();
const { getPlayer, getPlayerHistory, getPlayerStats, getAllPlayers } = require('../controllers/playerController');

router.get('/', getAllPlayers);
router.get('/:id', getPlayer);
router.get('/:id/history', getPlayerHistory);
router.get('/:id/stats', getPlayerStats);

module.exports = router;
