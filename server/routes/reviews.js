const express = require('express');
const router = express.Router();
const { Review, Product } = require('../models');

// GET reviews for a specific product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit a new review
router.post('/', async (req, res) => {
  try {
    const { productId, patronName, rating, comment, photos } = req.body;
    const newId = `rev-${Date.now()}`;

    const newReview = await Review.create({
      id: newId,
      productId,
      patronName: patronName || 'Verified Patron',
      rating: rating || 5,
      comment,
      photos: photos || [],
      isVerified: true
    });

    // Update product rating average & review count
    const reviews = await Review.find({ productId });
    if (reviews.length) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = parseFloat((sum / reviews.length).toFixed(1));
      await Product.findOneAndUpdate({ id: productId }, {
        $set: { rating: avg, reviewsCount: reviews.length }
      });
    }

    res.json({ success: true, id: newId, review: newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
