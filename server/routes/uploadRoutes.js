const express = require('express');
const router = express.Router();
const { upload, uploadPoster } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// POST /api/upload - Single poster image upload (Protected)
router.post('/', protect, upload.single('poster'), uploadPoster);

module.exports = router;
