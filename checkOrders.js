const mongoose = require('mongoose');
const Order = require('./server/models/orderModel');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const orders = await Order.find({}).populate('orderItems.product');
  const brokenOrders = orders.filter(o => o.orderItems.some(i => i.name === 'KAKASHI'));
  console.log(JSON.stringify(brokenOrders, null, 2));
  mongoose.connection.close();
});
