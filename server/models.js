const mongoose = require('mongoose');

// Variant Schema
const variantSchema = new mongoose.Schema({
  id: String,
  sku: String,
  colorName: String,
  colorHex: String,
  additionalPrice: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 5 }
});

// Artisan Schema
const artisanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  story: String,
  yearsExperience: { type: Number, default: 10 },
  region: String,
  avatarUrl: String,
  craftSpecialty: String,
  createdAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  basePrice: { type: Number, required: true },
  compareAtPrice: Number,
  craftTechnique: String,
  originRegion: String,
  artisanName: String,
  artisanBio: String,
  category: String,
  material: String,
  careInstructions: String,
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 1 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  silkMarkCertified: { type: Boolean, default: true },
  isSilkMarkCertified: { type: Boolean, default: true },
  giTagRegion: { type: String, default: 'Kashmir' },
  craftType: { type: String, default: 'Hand-loom' },
  craftingHours: { type: Number, default: 120 },
  artisanId: String,
  artisan: {
    id: String,
    name: String,
    story: String,
    yearsExperience: Number,
    region: String,
    avatarUrl: String,
    craftSpecialty: String
  },
  imageUrl: String,
  cloudinaryPublicId: String,
  createdBy: { type: String, default: 'Admin' },
  images: [String],
  variants: [variantSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  userId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  subtotal: Number,
  discountTotal: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  grandTotal: Number,
  status: { type: String, default: 'PENDING_FULFILLMENT' },
  paymentMethod: String,
  paymentId: String,
  courierName: String,
  trackingNumber: String,
  awbTrackingNumber: String,
  estimatedDeliveryDate: String,
  packingVideoUrl: String,
  trackingHistory: [{
    status: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  returnReason: String,
  returnPhotos: [String],
  returnRequestedAt: Date,
  shippingAddress: Object,
  items: Array,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Profile Schema
const profileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  role: { type: String, default: 'customer' },
  passwordHash: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Coupon Schema
const couponSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  discountType: String,
  discountValue: Number,
  minSubtotal: { type: Number, default: 0 },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  userId: String,
  userName: String,
  patronName: String,
  title: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  images: [String],
  photos: [String],
  isVerifiedPurchase: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  adminReply: String,
  createdAt: { type: Date, default: Date.now }
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  action: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  recipientType: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  recipientId: String,
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['ORDER_STATUS', 'SYSTEM', 'LOW_STOCK', 'REVIEW'], default: 'ORDER_STATUS' },
  isRead: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Artisan = mongoose.model('Artisan', artisanSchema);
const Order = mongoose.model('Order', orderSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Review = mongoose.model('Review', reviewSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Product,
  Artisan,
  Order,
  Profile,
  Coupon,
  Review,
  AuditLog,
  Notification
};
