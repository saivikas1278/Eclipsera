// Cookie Parser Helper
const parseCookies = (req) => {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
};

// Express Cookie Parser Middleware
const cookieParserMiddleware = (req, res, next) => {
  req.cookies = parseCookies(req);
  next();
};

// Admin Token & Cookie Verification (Strict Isolated Admin Credentials)
const verifyAdminToken = (req, res, next) => {
  const cookies = parseCookies(req);
  const token = req.headers['x-admin-token'] || cookies['eclipsera_admin_token'];
  
  if (token === 'eclipsera-admin-secure-session-token' || token === 'admin-authenticated-cookie-token') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: You do not have permissions to access this administrative feature.' });
  }
};

// Helmet HTTP Security Headers Middleware
const securityHeadersMiddleware = (req, res, next) => {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  next();
};

// NoSQL Injection Sanitizer
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key in obj) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

// Rate Limiter Memory Store
const rateLimitStores = {
  auth: new Map(),
  coupon: new Map(),
  general: new Map()
};

const createRateLimiter = (type, windowMs, maxRequests) => {
  const store = rateLimitStores[type] || new Map();
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    
    let record = store.get(ip);
    if (!record || (now - record.startTime) > windowMs) {
      record = { count: 1, startTime: now };
      store.set(ip, record);
    } else {
      record.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - record.startTime)) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: `Too Many Requests: Rate limit exceeded. Please try again in ${retryAfterSeconds} seconds.`
      });
    }

    next();
  };
};

const verifyCustomerToken = (req, res, next) => {
  const cookies = parseCookies(req);
  const token = req.headers['x-user-token'] || cookies['eclipsera_token'];
  
  if (token && token.startsWith('usr_session_')) {
    req.userId = token.replace('usr_session_', '');
    next();
  } else {
    res.status(401).json({ success: false, error: 'Access Denied: Please authenticate as a customer.' });
  }
};

const authRateLimiter = createRateLimiter('auth', 60 * 1000, 10);      // Max 10 requests per 1 min per IP
const couponRateLimiter = createRateLimiter('coupon', 60 * 1000, 15);   // Max 15 requests per 1 min per IP
const generalRateLimiter = createRateLimiter('general', 60 * 1000, 100); // Max 100 requests per 1 min per IP

module.exports = {
  verifyAdminToken,
  verifyCustomerToken,
  cookieParserMiddleware,
  securityHeadersMiddleware,
  mongoSanitizeMiddleware,
  authRateLimiter,
  couponRateLimiter,
  generalRateLimiter,
  parseCookies
};
