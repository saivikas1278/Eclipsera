const express = require('express');
const router = express.Router();
const { Coupon } = require('../models');
const { verifyAdminToken } = require('../middleware');

// GET all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Coupon
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const c = req.body;
    const newId = `c-${Date.now()}`;
    const newCoupon = await Coupon.create({
      id: newId,
      code: c.code.toUpperCase(),
      discountType: c.discountType,
      discountValue: c.discountValue,
      minSubtotal: c.minSubtotal || 0,
      description: c.description || ''
    });

    res.json({ success: true, id: newId, coupon: newCoupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
