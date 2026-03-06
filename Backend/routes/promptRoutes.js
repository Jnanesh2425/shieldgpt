const express = require('express');
const router = express.Router();
const { handlePrompt, getLogs, getStats, getRateLimitStatus } = require('../controllers/promptController');
const { checkRateLimit } = require('../middleware/rateLimiter');

// POST - Analyze and process a prompt (with rate limit check)
router.post('/prompt', checkRateLimit, handlePrompt);

// GET - Fetch all prompt logs
router.get('/logs', getLogs);

// GET - Fetch dashboard stats
router.get('/stats', getStats);

// GET - Fetch rate limit / blocked IPs status
router.get('/rate-limit-status', getRateLimitStatus);

module.exports = router;