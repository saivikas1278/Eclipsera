const express = require('express');
const router = express.Router();
const { Cart } = require('../models');
const { verifyCustomerToken } = require('../middleware');
const { isDbReady } = require('../store');

// In-Memory store fallback for persistent cart
const memoryCarts = new Map();

// GET Customer Cart
router.get('/', verifyCustomerToken, async (req, res) => {
  try {
    const userId = req.userId;
    let items = memoryCarts.get(userId) || [];

    if (isDbReady()) {
      try {
        const dbCart = await Cart.findOne({ userId });
        if (dbCart && dbCart.items) {
          items = dbCart.items;
          memoryCarts.set(userId, items);
        }
      } catch (e) {}
    }

    res.json({ success: true, data: { userId, items }, message: 'Cart retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST/PUT Sync or Update Customer Cart
router.post('/sync', verifyCustomerToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body || {};
    const validItems = Array.isArray(items) ? items : [];

    memoryCarts.set(userId, validItems);

    if (isDbReady()) {
      try {
        await Cart.findOneAndUpdate(
          { userId },
          { $set: { items: validItems, updatedAt: new Date() } },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    res.json({ success: true, data: { userId, items: validItems }, message: 'Cart synced successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Clear Customer Cart
router.delete('/', verifyCustomerToken, async (req, res) => {
  try {
    const userId = req.userId;
    memoryCarts.set(userId, []);

    if (isDbReady()) {
      try {
        await Cart.findOneAndUpdate(
          { userId },
          { $set: { items: [], updatedAt: new Date() } },
          { upsert: true }
        );
      } catch (e) {}
    }

    res.json({ success: true, data: { userId, items: [] }, message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
