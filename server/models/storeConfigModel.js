const mongoose = require('mongoose');

const slideSchema = mongoose.Schema({
  image: { type: String, default: '' },
  heading: { type: String, default: '' },
  subheading: { type: String, default: '' },
  cta: { type: String, default: '' },
  link: { type: String, default: '' },
});

const storeConfigSchema = mongoose.Schema({
  heroSlides: [slideSchema],
}, {
  timestamps: true,
});

const StoreConfig = mongoose.model('StoreConfig', storeConfigSchema);
module.exports = StoreConfig;
