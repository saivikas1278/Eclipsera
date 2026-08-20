const rateLimit = require('express-rate-limit');

// Strict limiter for authentication routes
const strictAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per window during testing
  message: {
    message: 'Too many authentication attempts from this IP, please try again after 5 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Global limiter for all other routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Increased limit for easier manual testing and frontend polling
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = {
  strictAuthLimiter,
  globalLimiter
};
