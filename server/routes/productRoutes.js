const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getUserReviews,
  getRelatedProducts,
  bulkUpdateProducts,
  subscribeStockAlert,
  getPersonalizedRecommendations,
  getFrequentlyBoughtTogether,
  aiSearchProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../services/cacheService');

router.get('/top', cacheMiddleware('products_top'), getTopProducts);
router.get('/recommendations', getPersonalizedRecommendations);
router.get('/ai-search', aiSearchProducts);
router.route('/my-reviews').get(protect, getUserReviews);

// Route: /api/products/
// GET is public, POST requires protect and admin
router.route('/')
  .get(cacheMiddleware('products_all'), getProducts)
  .post(protect, admin, createProduct);

router.route('/bulk-update').put(protect, admin, bulkUpdateProducts);

// Route: /api/products/:id
// GET is public, PUT and DELETE require protect and admin
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/related').get(getRelatedProducts);
router.route('/:id/bought-together').get(getFrequentlyBoughtTogether);
router.route('/:id/stock-alert').post(subscribeStockAlert);

module.exports = router;
