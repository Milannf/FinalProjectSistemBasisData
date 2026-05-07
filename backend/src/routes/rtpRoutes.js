const express = require('express');
const router = express.Router();
const { getRTPProfile, resetRTPProfile } = require('../controllers/rtpController');

router.get('/:playerId', getRTPProfile);
router.post('/reset/:playerId', resetRTPProfile);

module.exports = router;
