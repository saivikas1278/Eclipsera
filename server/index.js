const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db'); // Initializes MongoDB Atlas Connection & Seeder

const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const couponsRoutes = require('./routes/coupons');
const auditLogsRoutes = require('./routes/auditLogs');
const uploadRoutes = require('./routes/upload');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB Atlas Cloud Database Engine', storage: 'Cloudinary CDN', app: 'eclipsera_premium' });
});

app.listen(PORT, () => {
  console.log(`⚡ eclipsera_premium MongoDB Atlas Backend Server running at http://localhost:${PORT}`);
});
