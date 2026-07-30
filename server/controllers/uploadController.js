const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `poster-${uniqueSuffix}${ext}`);
  }
});

// File filter (Images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Upload Single File Controller Handler
const uploadPoster = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
      errors: ['File is required']
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'Poster image uploaded successfully',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    }
  });
};

module.exports = {
  upload,
  uploadPoster
};
