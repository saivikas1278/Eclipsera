const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage with multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products', 
    // We removed allowed_formats here because it aggressively rejects files with weird names like 'image.webp.jpg'
  },
});

const upload = multer({ 
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only valid image files are allowed!'), false);
    }
  }
});

// POST /api/upload
// Note: We use upload.single('image') where 'image' must match the field name in the frontend FormData
router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error("Upload Error:", err);
      res.status(400);
      return res.json({ message: err.message || err.toString() || 'Image upload failed' });
    }
    
    if (req.file) {
      // req.file.path will contain the secure Cloudinary URL (https://res.cloudinary.com/...)
      res.send(req.file.path); 
    } else {
      res.status(400);
      res.json({ message: 'No image file provided' });
    }
  });
});

module.exports = router;
