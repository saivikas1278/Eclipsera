const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'NOTIFIED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

stockAlertSchema.index({ product: 1, status: 1 });

const StockAlert = mongoose.model('StockAlert', stockAlertSchema);
module.exports = StockAlert;
