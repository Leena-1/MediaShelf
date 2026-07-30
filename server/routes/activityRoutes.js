const express = require('express');
const router = express.Router();
const { getActivityLogs, clearActivityLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getActivityLogs);
router.delete('/', clearActivityLogs);

module.exports = router;
