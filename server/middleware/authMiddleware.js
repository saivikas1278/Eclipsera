const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * Middleware to protect routes.
 * Checks for a valid JWT in the Authorization header.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // The header looks like: "Bearer <token_string>"
      // We split by space and take the token at index 1
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      // The decoded object will contain the payload we signed (the user id)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database and attach it to the request object.
      // We use .select('-password') to ensure we DO NOT send the hashed password 
      // along with the user object to our routes.
      req.user = await User.findById(decoded.id).select('-password');

      // Proceed to the next middleware or the route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  // If there's no token at all
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Middleware to check if the user is an admin.
 * Must be used AFTER the 'protect' middleware so req.user is already populated.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    // User exists and is an admin, let them proceed
    next();
  } else {
    // User is either not logged in (which shouldn't happen if 'protect' ran first) 
    // or they are not an admin
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

/**
 * Middleware for routes that can be accessed by both guests and authenticated users.
 * Populates req.user if a valid token is present, otherwise does nothing.
 */
const optionalProtect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token exists but failed, just leave req.user undefined
      console.error('optionalProtect token failed:', error.message);
    }
  }
  next();
});

module.exports = { protect, admin, optionalProtect };
