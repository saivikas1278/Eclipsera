// 1. Import necessary packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 3. Load environment variables from the .env file
// This MUST happen before requiring local routes/config so they have access to process.env
dotenv.config();

// 2. Import the database connection and routes
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
const configRoutes = require('./routes/configRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');
const { globalLimiter } = require('./middleware/rateLimiter');

// 4. Connect to MongoDB
connectDB();

// 5. Initialize the Express application
const app = express();

// --- Middlewares ---

// Apply global rate limiter
app.use('/api', globalLimiter);

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Parse incoming JSON payloads
// This allows you to read req.body in your routes when users submit data
app.use(express.json());

// --- Routes ---
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/config', configRoutes);
app.use('/', sitemapRoutes);

// Initialize Background Jobs
require('./jobs/abandonedCart');

// A simple test route to verify the server is running
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running...' });
});

// Razorpay config route
app.get('/api/config/razorpay', (req, res) => {
  res.send(process.env.RAZORPAY_KEY_ID || 'dummy_razorpay_key');
});

// --- Error Handling Middlewares ---

// 1. 404 Not Found Handler
// This catches any requests that don't match our defined routes above.
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  // Pass the error along to the next middleware (which is our general error handler below)
  next(error); 
});

// 2. General Error Handler
// This catches any errors thrown in our routes or passed from the 404 handler.
// It formats the error as JSON instead of an ugly HTML page, which is crucial for APIs.
app.use((err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Check for Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  res.status(statusCode);
  res.json({
    message: message,
    // Only show the detailed stack trace if we are not in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- Server Startup ---

// Define the port, defaulting to 5000 if not specified in .env
const PORT = process.env.PORT || 5000;

// Tell the Express app to listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
