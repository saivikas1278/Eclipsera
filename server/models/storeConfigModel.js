const mongoose = require('mongoose');

const slideSchema = mongoose.Schema({
  image: { type: String, required: true },
  heading: { type: String, required: true },
  subheading: { type: String, required: true },
  cta: { type: String, required: true },
  link: { type: String, required: true },
});

const storeConfigSchema = mongoose.Schema({
  heroSlides: [slideSchema],
}, {
  timestamps: true,
});

const StoreConfig = mongoose.model('StoreConfig', storeConfigSchema);
module.exports = StoreConfig;
