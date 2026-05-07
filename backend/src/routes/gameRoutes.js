const express = require('express');
const router = express.Router();
const { startSession, endSession, spin } = require('../controllers/gameController');

router.post('/spin', spin);
router.post('/start-session', startSession);
router.post('/end-session', endSession);

module.exports = router;
