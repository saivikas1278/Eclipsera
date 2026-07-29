const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../cloudinary');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/upload - Upload file to Cloudinary
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'eclipsera_products',
      resource_type: 'image'
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id
      });
    }
  );

  uploadStream.end(req.file.buffer);
});

module.exports = router;
