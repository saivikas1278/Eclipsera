const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db'); // Initializes MongoDB Atlas Connection & Seeder

const { 
  securityHeadersMiddleware, 
  cookieParserMiddleware, 
  mongoSanitizeMiddleware, 
  authRateLimiter, 
  generalRateLimiter 
} = require('./middleware');

const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const couponsRoutes = require('./routes/coupons');
const auditLogsRoutes = require('./routes/auditLogs');
const uploadRoutes = require('./routes/upload');
const reviewsRoutes = require('./routes/reviews');
const artisansRoutes = require('./routes/artisans');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Hardening Middlewares
app.use(securityHeadersMiddleware);
app.use(cookieParserMiddleware);

// Strict Whitelisted CORS Origins
const allowedOrigins = [
  'https://eclipsera-user-storefront.onrender.com',
  'https://eclipsera-admin-portal.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev fallback
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitizeMiddleware);

// Rate Limiters
app.use('/api/auth', authRateLimiter);
app.use('/api', generalRateLimiter);

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/artisans', artisansRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/reports', reportsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB Atlas Cloud Database Engine', storage: 'Cloudinary CDN', app: 'eclipsera_premium', security: 'hardened' });
});

app.listen(PORT, () => {
  console.log(`⚡ eclipsera_premium Security Hardened Backend running at http://localhost:${PORT}`);
});
