const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('./models/notificationModel');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();

const seedNotifications = async () => {
  try {
    await connectDB();

    // Get a user (e.g. the first admin user or just the first user)
    const user = await User.findOne({});
    
    if (user) {
      await Notification.create({
        user: user._id,
        title: 'Welcome to Premium Artisan!',
        message: 'We are thrilled to have you here. Explore our handcrafted collections and let us know what you think!',
        type: 'promo'
      });
      
      await Notification.create({
        user: user._id,
        title: 'Order Delivered',
        message: 'Your order #120938 has been delivered. Leave a review to get 10% off your next purchase!',
        type: 'order'
      });

      console.log('Notifications seeded for user:', user.email);
    } else {
      console.log('No users found to seed notifications for.');
    }
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedNotifications();
