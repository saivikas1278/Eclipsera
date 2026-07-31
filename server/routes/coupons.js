const express = require('express');
const router = express.Router();
const { Coupon } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady } = require('../store');

// In-Memory Fallback Coupon Store
let memoryCoupons = [
  {
    id: 'c-101',
    code: 'LUXURY10',
    discountPercentage: 10,
    discountType: 'percentage',
    discountValue: 10,
    minSubtotal: 0,
    maxUses: 100,
    usedCount: 5,
    isActive: true,
    description: 'Exclusive 10% Heritage Curator Discount'
  },
  {
    id: 'c-102',
    code: 'HERITAGE15',
    discountPercentage: 15,
    discountType: 'percentage',
    discountValue: 15,
    minSubtotal: 5000,
    maxUses: 50,
    usedCount: 12,
    isActive: true,
    description: '15% Discount on Luxury Orders over ₹5,000'
  }
];

// GET all coupons
router.get('/', async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const dbCoupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
        if (dbCoupons && dbCoupons.length) return res.json(dbCoupons);
      } catch (e) {}
    }
    res.json(memoryCoupons);
  } catch (err) {
    res.json(memoryCoupons);
  }
});

// POST Create Coupon (Admin)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const c = req.body;
    const newId = c.id || `c-${Date.now()}`;
    const code = (c.code || 'PROMO10').toUpperCase();
    const discountPercentage = Number(c.discountPercentage || c.discountValue) || 10;

    const newCouponObj = {
      id: newId,
      code,
      discountPercentage,
      discountType: c.discountType || 'percentage',
      discountValue: discountPercentage,
      minSubtotal: Number(c.minSubtotal) || 0,
      maxUses: Number(c.maxUses) || 100,
      usedCount: 0,
      isActive: true,
      description: c.description || 'Curator Promotional Discount',
      createdAt: new Date().toISOString()
    };

    memoryCoupons.unshift(newCouponObj);

    if (isDbReady()) {
      try {
        await Coupon.create(newCouponObj);
      } catch (dbErr) {}
    }

    res.json({ success: true, id: newId, coupon: newCouponObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Validate & Apply Coupon (Customer)
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    const queryCode = (code || '').trim().toUpperCase();

    let coupon = memoryCoupons.find(c => c.code === queryCode && c.isActive);

    if (!coupon && isDbReady()) {
      try {
        coupon = await Coupon.findOne({ code: queryCode, isActive: true });
      } catch (e) {}
    }

    if (!coupon) {
      return res.status(404).json({ valid: false, error: `Invalid or expired coupon code "${queryCode}".` });
    }

    if (subtotal < (coupon.minSubtotal || 0)) {
      return res.status(400).json({ 
        valid: false, 
        error: `Coupon "${queryCode}" requires a minimum order subtotal of ₹${coupon.minSubtotal.toLocaleString()}.` 
      });
    }

    const discountPercentage = coupon.discountPercentage || coupon.discountValue || 10;
    const discountAmount = Math.round((subtotal * discountPercentage) / 100);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    res.json({
      valid: true,
      code: coupon.code,
      discountPercentage,
      discountAmount,
      subtotal,
      finalTotal,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount.toLocaleString()}.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.memoryCoupons = memoryCoupons;
module.exports = router;
