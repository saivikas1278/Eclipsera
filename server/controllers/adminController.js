const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Execute all queries concurrently for performance
  const [orders, totalUsers, totalProducts, totalOrders, lowStockItems] = await Promise.all([
    Order.find({}), // To calculate revenue
    User.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
    Product.find({ countInStock: { $lt: 5 } }),
  ]);

  // Calculate total revenue
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

  res.json({
    totalRevenue,
    totalUsers,
    totalProducts,
    totalOrders,
    lowStockItems,
  });
});

module.exports = {
  getDashboardStats,
};
