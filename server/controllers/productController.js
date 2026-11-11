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
    .select('name price image rating numReviews countInStock category')
    .skip(limit * (page - 1))
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

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
  const product = await Product.findById(req.params.id).lean();

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
  await clearCache('products_top');
  res.status(201).json(createdProduct);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, images, countInStock, paymentQRCode, upiId } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const previousStock = product.countInStock || 0;
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    if (images !== undefined) product.images = images;
    product.countInStock = countInStock;
    if (paymentQRCode !== undefined) product.paymentQRCode = paymentQRCode;
    if (upiId !== undefined) product.upiId = upiId;

    const updatedProduct = await product.save();

    // Automated Back-in-Stock Customer Notification
    if (previousStock === 0 && Number(countInStock) > 0) {
      (async () => {
        try {
          const StockAlert = require('../models/stockAlertModel');
          const { sendEmail } = require('../utils/sendEmail');
          const alerts = await StockAlert.find({ product: product._id, status: 'PENDING' });
          for (const alert of alerts) {
            await sendEmail({
              to: alert.email,
              subject: `Back in Stock: ${product.name}`,
              text: `Great news! "${product.name}" is back in stock at Eclipsera Premium. Grab yours before it sells out again!\n\nView product: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${product._id}`,
            });
            alert.status = 'NOTIFIED';
            await alert.save();
          }
        } catch (err) {
          console.error('Stock alert notification error:', err.message);
        }
      })();
    }

    await clearCache('products_all');
    await clearCache('products_top');
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
    await clearCache('products_top');
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
    await clearCache('products_all');
    await clearCache('products_top');
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
  // Get top 4 rated products, selecting only necessary fields
  const products = await Product.find({})
    .select('name price image rating numReviews countInStock category')
    .sort({ rating: -1 })
    .limit(4)
    .lean();
  res.json(products);
});

/**
 * @desc    Get user's reviews
 * @route   GET /api/products/my-reviews
 * @access  Private
 */
const getUserReviews = asyncHandler(async (req, res) => {
  // Find all products where the reviews array contains an object with the user's ID
  const products = await Product.find({ 'reviews.user': req.user._id }).lean();
  
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
  await clearCache('products_top');

  res.json({ message: `Successfully updated ${updates.length} products` });
});

/**
 * @desc    Subscribe to back-in-stock notification
 * @route   POST /api/products/:id/stock-alert
 * @access  Public
 */
const subscribeStockAlert = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400);
    throw new Error('Valid email address is required');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const StockAlert = require('../models/stockAlertModel');
  const existing = await StockAlert.findOne({
    product: req.params.id,
    email: email.toLowerCase(),
    status: 'PENDING',
  });

  if (existing) {
    return res.status(200).json({ message: 'You are already registered for alerts on this item.' });
  }

  await StockAlert.create({
    product: req.params.id,
    email: email.toLowerCase(),
  });

  res.status(201).json({ message: 'Successfully subscribed to stock notification.' });
});

/**
 * @desc    Get personalized product recommendations based on browsing affinity
 * @route   GET /api/products/recommendations
 * @access  Public
 */
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const viewedIds = (req.query.viewed || '').split(',').filter(Boolean);

  let targetCategories = [];
  if (viewedIds.length > 0) {
    const viewedProducts = await Product.find({ _id: { $in: viewedIds } }).select('category');
    targetCategories = [...new Set(viewedProducts.map(p => p.category).filter(Boolean))];
  }

  let recommendations = [];
  if (targetCategories.length > 0) {
    recommendations = await Product.find({
      category: { $in: targetCategories },
      _id: { $nin: viewedIds },
      countInStock: { $gt: 0 },
    })
      .sort({ rating: -1, numReviews: -1 })
      .limit(8)
      .lean();
  }

  // Fallback to top curated items if empty or insufficient
  if (recommendations.length < 4) {
    const additional = await Product.find({
      _id: { $nin: [...viewedIds, ...recommendations.map(r => r._id)] },
      countInStock: { $gt: 0 },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(8 - recommendations.length)
      .lean();
    recommendations = [...recommendations, ...additional];
  }

  res.json(recommendations);
});

/**
 * @desc    Get complementary products frequently bought together
 * @route   GET /api/products/:id/bought-together
 * @access  Public
 */
const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  const currentProduct = await Product.findById(req.params.id);
  if (!currentProduct) {
    res.status(404);
    throw new Error('Product not found');
  }

  const Order = require('../models/orderModel');
  const orders = await Order.find({ 'orderItems.product': req.params.id })
    .select('orderItems.product')
    .limit(50)
    .lean();

  const productCounts = {};
  orders.forEach(order => {
    order.orderItems?.forEach(item => {
      const pid = item.product?.toString();
      if (pid && pid !== req.params.id) {
        productCounts[pid] = (productCounts[pid] || 0) + 1;
      }
    });
  });

  const sortedIds = Object.keys(productCounts)
    .sort((a, b) => productCounts[b] - productCounts[a])
    .slice(0, 3);

  let complementary = [];
  if (sortedIds.length > 0) {
    complementary = await Product.find({ _id: { $in: sortedIds }, countInStock: { $gt: 0 } }).lean();
  }

  // Fallback to same category items
  if (complementary.length === 0) {
    complementary = await Product.find({
      _id: { $ne: req.params.id },
      category: currentProduct.category,
      countInStock: { $gt: 0 },
    })
      .limit(2)
      .lean();
  }

  res.json(complementary);
});

/**
 * @desc    AI Semantic & Natural Language Search
 * @route   GET /api/products/ai-search
 * @access  Public
 */
const aiSearchProducts = asyncHandler(async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.json({ query: '', parsedFilters: {}, products: [] });
  }

  const lower = query.toLowerCase();
  let maxPrice = null;
  let minPrice = null;

  // Extract budget: "under 1500", "below 2000", "< 3000", "within 1000", "under 1.5k"
  const underMatch = lower.match(/(?:under|below|less than|within|<=?)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (underMatch) {
    let val = parseFloat(underMatch[1]);
    if (underMatch[2]) val *= 1000;
    maxPrice = val;
  }

  const aboveMatch = lower.match(/(?:above|over|more than|>=?)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(k)?/i);
  if (aboveMatch) {
    let val = parseFloat(aboveMatch[1]);
    if (aboveMatch[2]) val *= 1000;
    minPrice = val;
  }

  const categoryKeywords = {
    Jewelry: ['jewelry', 'ring', 'necklace', 'bracelet', 'pendant', 'chain', 'earring', 'silver', 'gold'],
    Apparel: ['apparel', 'shirt', 'hoodie', 'tshirt', 'cloth', 'wear', 'jacket'],
    Accessories: ['accessory', 'accessories', 'keychain', 'bag', 'wallet', 'case', 'strap'],
  };

  let detectedCategory = null;
  for (const [cat, words] of Object.entries(categoryKeywords)) {
    if (words.some(w => lower.includes(w))) {
      detectedCategory = cat;
      break;
    }
  }

  const cleanSearchTerms = lower
    .replace(/(?:under|below|above|over|less than|more than)\s*(?:rs\.?|inr|₹)?\s*\d+\s*k?/gi, '')
    .replace(/\b(for|a|an|the|gift|best|cheap|luxury|items|products|looking|want|show|me)\b/gi, '')
    .trim();

  const conditions = [];

  if (maxPrice !== null) {
    conditions.push({ price: { $lte: maxPrice } });
  }
  if (minPrice !== null) {
    conditions.push({ price: { $gte: minPrice } });
  }
  if (detectedCategory) {
    conditions.push({ category: detectedCategory });
  }

  if (cleanSearchTerms) {
    const termRegex = new RegExp(cleanSearchTerms.split(/\s+/).filter(Boolean).join('|'), 'i');
    conditions.push({
      $or: [
        { name: termRegex },
        { description: termRegex },
        { category: termRegex },
        { materials: termRegex },
        { story: termRegex },
      ],
    });
  }

  let mongoQuery = conditions.length > 0 ? { $and: conditions } : {};
  let products = await Product.find(mongoQuery)
    .sort({ rating: -1, countInStock: -1 })
    .limit(16)
    .lean();

  if (products.length === 0 && cleanSearchTerms) {
    const termRegex = new RegExp(cleanSearchTerms.split(/\s+/)[0], 'i');
    products = await Product.find({
      $or: [{ name: termRegex }, { description: termRegex }],
    })
      .limit(10)
      .lean();
  }

  res.json({
    query,
    parsedFilters: {
      detectedCategory,
      maxPrice,
      minPrice,
      keywords: cleanSearchTerms,
    },
    count: products.length,
    products,
  });
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
  subscribeStockAlert,
  getPersonalizedRecommendations,
  getFrequentlyBoughtTogether,
  aiSearchProducts,
};
