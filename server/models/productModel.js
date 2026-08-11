const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    // The 'user' field references the User model.
    // This allows us to track which admin user created or updated this product.
    // 'ref' must match the name given in mongoose.model('User', ...)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      default: 'General',
    },
    images: [String],
    variants: [
      {
        name: { type: String, required: true },
        countInStock: { type: Number, required: true, default: 0 },
      }
    ],
    isPersonalizable: {
      type: Boolean,
      default: false,
    },
    personalizationLabel: {
      type: String,
      default: 'Custom Engraving (Max 20 chars)',
    },
    processingTime: {
      type: String,
      default: 'Handmade in 3-5 business days',
    },
    story: {
      type: String,
    },
    materials: {
      type: String,
    },
    shippingReturns: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
