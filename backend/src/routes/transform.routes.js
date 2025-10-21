const express = require('express');
const multer = require('multer');
const transformController = require('../controllers/transform.controller');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Routes
router.post('/transform', upload.single('image'), transformController.transformImage);
router.get('/health', transformController.healthCheck);

module.exports = router;
