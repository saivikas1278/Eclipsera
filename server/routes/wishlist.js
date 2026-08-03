const express = require('express');
const router = express.Router();
const { Wishlist } = require('../models');
const { verifyCustomerToken } = require('../middleware');
const { isDbReady } = require('../store');

// In-Memory store fallback for persistent wishlist
const memoryWishlists = new Map();

// GET Customer Wishlist
router.get('/', verifyCustomerToken, async (req, res) => {
  try {
    const userId = req.userId;
    let productIds = memoryWishlists.get(userId) || [];

    if (isDbReady()) {
      try {
        const dbWishlist = await Wishlist.findOne({ userId });
        if (dbWishlist && dbWishlist.productIds) {
          productIds = dbWishlist.productIds;
          memoryWishlists.set(userId, productIds);
        }
      } catch (e) {}
    }

    res.json({ success: true, data: { userId, productIds }, message: 'Wishlist retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Sync or Update Customer Wishlist
router.post('/sync', verifyCustomerToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productIds } = req.body || {};
    const validIds = Array.isArray(productIds) ? productIds : [];

    memoryWishlists.set(userId, validIds);

    if (isDbReady()) {
      try {
        await Wishlist.findOneAndUpdate(
          { userId },
          { $set: { productIds: validIds, updatedAt: new Date() } },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    res.json({ success: true, data: { userId, productIds: validIds }, message: 'Wishlist synced successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
