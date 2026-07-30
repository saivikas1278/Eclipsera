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
  productId: String,
  patronName: String,
  rating: Number,
  comment: String,
  photos: [String],
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  action: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Artisan = mongoose.model('Artisan', artisanSchema);
const Order = mongoose.model('Order', orderSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Review = mongoose.model('Review', reviewSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = {
  Product,
  Artisan,
  Order,
  Profile,
  Coupon,
  Review,
  AuditLog
};
