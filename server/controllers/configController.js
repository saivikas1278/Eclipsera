const asyncHandler = require('express-async-handler');
const StoreConfig = require('../models/storeConfigModel');

// @desc    Get storefront config
// @route   GET /api/config/storefront
// @access  Public
const getStorefrontConfig = asyncHandler(async (req, res) => {
  const config = await StoreConfig.findOne({});
  
  if (config) {
    res.json(config);
  } else {
    // If no config exists, return null so frontend can use fallbacks
    res.json({ heroSlides: [] });
  }
});

// @desc    Update storefront config
// @route   PUT /api/config/storefront
// @access  Private/Admin
const updateStorefrontConfig = asyncHandler(async (req, res) => {
  const { heroSlides } = req.body;

  // Find the first (and only) config document, or create one if it doesn't exist
  let config = await StoreConfig.findOne({});

  if (config) {
    config.heroSlides = heroSlides || config.heroSlides;
    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } else {
    // Create new document
    config = new StoreConfig({
      heroSlides: heroSlides || []
    });
    const createdConfig = await config.save();
    res.status(201).json(createdConfig);
  }
});

module.exports = { getStorefrontConfig, updateStorefrontConfig };
