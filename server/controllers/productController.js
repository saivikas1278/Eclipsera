const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { recordAuditLog } = require('../services/auditService');
const { clearCache } = require('../services/cacheService');

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || req.query.keyword || '';
  const category = req.query.category || '';
  const minPrice = parseInt(req.query.minPrice) || 0;
  const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
  const inStock = req.query.inStock === 'true';

  const filter = {};
  
  if (search) {
    filter.$text = { $search: search };
  }
  
  if (category && category !== 'All') {
    filter.category = category;
  }
  
  filter.price = { $gte: minPrice, $lte: maxPrice };
  
  if (inStock) {
    filter.countInStock = { $gt: 0 };
  }

  const totalCount = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .skip(limit * (page - 1))
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    data: products,
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
    totalCount
  });
});

/**
 * @desc    Fetch a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  // Find the product by the ID passed in the URL (req.params.id)
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    // If we can't find a product with that ID, throw a 404
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    description: 'Sample description',
    countInStock: 0,
  });

  const createdProduct = await product.save();
  await clearCache('products_all');
  res.status(201).json(createdProduct);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, countInStock, paymentQRCode, upiId } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.countInStock = countInStock;
    if (paymentQRCode !== undefined) product.paymentQRCode = paymentQRCode;
    if (upiId !== undefined) product.upiId = upiId;

    const updatedProduct = await product.save();
    await clearCache('products_all');
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  // Using findByIdAndDelete ensures the document is removed directly. 
  // Wait, the prompt specifically says "delete it from the database and return a success message."
  // Note: mongoose 9+ supports deleteOne(). 
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    await clearCache('products_all');
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Create new review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    // Verify that the user has actually purchased and paid for this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': product._id,
      isPaid: true
    });

    if (!hasPurchased) {
      res.status(403); // 403 Forbidden
      throw new Error('You must purchase and pay for this product before leaving a review');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Get top rated products
 * @route   GET /api/products/top
 * @access  Public
 */
const getTopProducts = asyncHandler(async (req, res) => {
  // Get top 4 rated products
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);
  res.json(products);
});

/**
 * @desc    Get user's reviews
 * @route   GET /api/products/my-reviews
 * @access  Private
 */
const getUserReviews = asyncHandler(async (req, res) => {
  // Find all products where the reviews array contains an object with the user's ID
  const products = await Product.find({ 'reviews.user': req.user._id });
  
  // Format the response to just return a flat list of the user's reviews
  // along with the product info they belong to
  const userReviews = [];
  
  products.forEach(product => {
    const userReview = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    
    if (userReview) {
      userReviews.push({
        _id: userReview._id,
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        rating: userReview.rating,
        comment: userReview.comment,
        createdAt: userReview.createdAt
      });
    }
  });
  
  // Sort by newest first
  userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(userReviews);
});

/**
 * @desc    Get related products by category
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (product) {
    // Find products in same category, exclude current product, limit to 4
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category || 'General'
    }).limit(4);
    
    // If not enough related in category, fetch random ones to fill up
    if (relatedProducts.length < 4) {
      const moreProducts = await Product.find({
        _id: { $nin: [product._id, ...relatedProducts.map(p => p._id)] }
      }).limit(4 - relatedProducts.length);
      relatedProducts.push(...moreProducts);
    }
    
    res.json(relatedProducts);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

/**
 * @desc    Bulk update products inline
 * @route   PUT /api/products/bulk-update
 * @access  Private/Admin
 */
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    res.status(400);
    throw new Error('No updates provided');
  }

  for (const update of updates) {
    const product = await Product.findById(update._id);
    if (product) {
      if (update.price !== undefined) product.price = update.price;
      if (update.stockQuantity !== undefined) product.countInStock = update.stockQuantity;
      await product.save();
    }
  }

  await recordAuditLog(`Bulk inline update performed on ${updates.length} products`, 'CATALOG');
  await clearCache('products_all');

  res.json({ message: `Successfully updated ${updates.length} products` });
});


module.exports = {
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
};
