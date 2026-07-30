const express = require('express');
const { protect } = require('../middleware/auth');
const {
  analyzeLibrary,
  getRecommendations,
  smartSearch,
  generateDescription
} = require('./ai.controller');
const router = express.Router();
let aiLimiter = (req, res, next) => next();

try {
  const rateLimit = require('express-rate-limit');
  aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
      success: false,
      message: 'AI request limit reached. Please try again after a few minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
} catch (e) {
  console.warn('express-rate-limit not loaded, skipping rate limiting.');
}

// Protect all AI endpoints with JWT authentication and rate limiting
router.use(protect);
router.use(aiLimiter);

router.post('/analyze', analyzeLibrary);
router.post('/recommend', getRecommendations);
router.post('/search', smartSearch);
router.post('/generate', generateDescription);

module.exports = router;
