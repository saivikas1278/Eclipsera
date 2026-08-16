const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./models/productModel');
  await Product.updateMany({}, { $set: { paymentQRCode: '', upiId: '' } });
  console.log('Cleared QR codes');
  process.exit();
}).catch(console.error);
