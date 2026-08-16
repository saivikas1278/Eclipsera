const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // References the buyer's User document.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'User',
    },
    // orderItems is an array of objects.
    // Each object represents a product the user is purchasing.
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        // References the actual Product document to keep a link back to the catalog.
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        image: { type: String }, // To show the item image in order history
        variant: { type: String }, // e.g. "Small"
        personalization: { type: String }, // e.g. "Engraved: John"
      },
    ],
    // Nested object for shipping details
    shippingAddress: {
      name: { type: String }, // For guest orders or explicit shipping name
      email: { type: String }, // For guest orders
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'COD', // 'COD' or 'PHONEPE'
    },
    paymentReceipt: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    financialStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUND_PENDING', 'REFUNDED'],
      default: 'PENDING',
    },
    paidAt: {
      type: Date,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      email_address: { type: String },
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    fulfillmentStatus: {
      type: String,
      default: 'PENDING',
    },
    trackingNumber: {
      type: String,
    },
    fulfillmentNote: {
      type: String,
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        note: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
