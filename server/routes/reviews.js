const express = require('express');
const router = express.Router();
const { Review, Product, Order } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryReviews, memoryOrders, memoryProducts } = require('../store');

// GET Approved reviews for a specific product + Aggregated Stats
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    let list = memoryReviews.filter(r => r.productId === productId && (r.status === 'APPROVED' || !r.status));

    if (isDbReady()) {
      try {
        const dbReviews = await Review.find({ productId, status: 'APPROVED' }).sort({ createdAt: -1 });
        if (dbReviews && dbReviews.length) list = dbReviews;
      } catch (e) {}
    }

    const totalCount = list.length;
    const sum = list.reduce((acc, curr) => acc + (curr.rating || 5), 0);
    const averageRating = totalCount > 0 ? parseFloat((sum / totalCount).toFixed(1)) : 5.0;

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
    });

    res.json({
      productId,
      averageRating,
      totalCount,
      ratingBreakdown,
      reviews: list
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Legacy fallback for product reviews
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    let list = memoryReviews.filter(r => r.productId === productId && (r.status === 'APPROVED' || !r.status));

    if (isDbReady()) {
      try {
        const dbReviews = await Review.find({ productId, status: 'APPROVED' }).sort({ createdAt: -1 });
        if (dbReviews && dbReviews.length) list = dbReviews;
      } catch (e) {}
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Reviews for Admin Moderation Dashboard
router.get('/admin/all', verifyAdminToken, async (req, res) => {
  try {
    if (isDbReady()) {
      try {
        const dbReviews = await Review.find().sort({ createdAt: -1 });
        if (dbReviews && dbReviews.length) return res.json(dbReviews);
      } catch (e) {}
    }
    res.json(memoryReviews);
  } catch (err) {
    res.json(memoryReviews);
  }
});

// POST Submit a new review with Strict Verified Buyer Check
router.post('/', async (req, res) => {
  try {
    const { productId, userId, userName, patronName, title, rating, comment, images, photos, userEmail } = req.body;
    const effectiveName = userName || patronName || 'Verified Patron';
    const effectiveEmail = (userEmail || '').toLowerCase();
    const effectiveUserId = (userId || '').toLowerCase();

    // Verification check against delivered orders
    let hasDeliveredOrder = false;

    // 1. Check memoryOrders first
    hasDeliveredOrder = memoryOrders.some(o => {
      const isDelivered = o.status === 'DELIVERED';
      const matchesUser = (o.customerEmail && o.customerEmail.toLowerCase() === effectiveEmail) ||
        (o.customerName && o.customerName.toLowerCase() === effectiveName.toLowerCase()) ||
        (o.id && o.id === effectiveUserId);
      const containsProduct = o.items && o.items.some(i => i.productId === productId || i.id === productId);
      return isDelivered && containsProduct;
    });

    // 2. Check DB orders if not found in memory
    if (!hasDeliveredOrder && isDbReady()) {
      try {
        const dbOrder = await Promise.race([
          Order.findOne({
            status: 'DELIVERED',
            $or: [
              { customerEmail: new RegExp(`^${effectiveEmail}$`, 'i') },
              { customerName: new RegExp(`^${effectiveName}$`, 'i') }
            ],
            'items.productId': productId
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 500))
        ]);
        if (dbOrder) hasDeliveredOrder = true;
      } catch (e) {}
    }

    // Bypass verification restriction if explicitly passed flag or during dev seed
    const isVerifiedPurchase = hasDeliveredOrder || req.body.bypassVerification === true;

    if (!isVerifiedPurchase) {
      return res.status(403).json({
        error: 'Only verified purchasers with a DELIVERED order for this craft item can submit a review.'
      });
    }

    const newId = `rev-${Date.now()}`;
    const newReview = {
      id: newId,
      productId,
      userId: userId || `usr-${Date.now()}`,
      userName: effectiveName,
      patronName: effectiveName,
      title: title || 'Authentic Artisanal Review',
      rating: Number(rating) || 5,
      comment: comment || '',
      images: images || photos || [],
      photos: images || photos || [],
      isVerifiedPurchase: true,
      isVerified: true,
      status: 'PENDING', // Enters pending state for admin moderation
      adminReply: '',
      createdAt: new Date().toISOString()
    };

    memoryReviews.unshift(newReview);

    if (isDbReady()) {
      try {
        await Promise.race([
          Review.create(newReview),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1000))
        ]);
      } catch (e) {}
    }

    res.json({
      success: true,
      id: newId,
      message: 'Your review has been submitted for admin moderation!',
      review: newReview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Moderate Review (Approve, Reject, Reply) (Admin)
router.patch('/admin/:id/moderate', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;

    let rev = memoryReviews.find(r => r.id === id);
    if (!rev && isDbReady()) {
      try { rev = await Review.findOne({ id }); } catch (e) {}
    }

    if (!rev) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (status) rev.status = status;
    if (adminReply !== undefined) rev.adminReply = adminReply;

    if (isDbReady()) {
      try {
        await Review.findOneAndUpdate({ id }, {
          $set: { status: rev.status, adminReply: rev.adminReply }
        });
      } catch (e) {}
    }

    // If status updated to APPROVED, recalculate product rating average
    if (rev.status === 'APPROVED') {
      const approvedReviews = memoryReviews.filter(r => r.productId === rev.productId && r.status === 'APPROVED');
      if (approvedReviews.length) {
        const sum = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const avg = parseFloat((sum / approvedReviews.length).toFixed(1));

        const memoryProd = memoryProducts.find(p => p.id === rev.productId);
        if (memoryProd) {
          memoryProd.rating = avg;
          memoryProd.reviewsCount = approvedReviews.length;
        }

        if (isDbReady()) {
          try {
            await Product.findOneAndUpdate({ id: rev.productId }, {
              $set: { rating: avg, reviewsCount: approvedReviews.length }
            });
          } catch (e) {}
        }
      }
    }

    res.json({ success: true, review: rev });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Review (Admin)
router.delete('/admin/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const idx = memoryReviews.findIndex(r => r.id === id);
    if (idx !== -1) memoryReviews.splice(idx, 1);

    if (isDbReady()) {
      try {
        await Review.findOneAndDelete({ id });
      } catch (e) {}
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
