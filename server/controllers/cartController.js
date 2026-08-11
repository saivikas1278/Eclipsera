const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');

/**
 * @desc    Get user cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  
  res.json(cart);
});

/**
 * @desc    Update user cart
 * @route   POST /api/cart
 * @access  Private
 */
const updateCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.items = items;
    // Reset abandoned email flag since they just interacted with the cart
    cart.abandonedEmailSent = false;
    await cart.save();
  } else {
    cart = await Cart.create({
      user: req.user._id,
      items,
      abandonedEmailSent: false,
    });
  }
  
  res.json(cart);
});

module.exports = { getCart, updateCart };
