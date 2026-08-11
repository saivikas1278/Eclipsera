const cron = require('node-cron');
const Cart = require('../models/cartModel');
const { sendAbandonedCartEmail } = require('../services/emailService');

// Schedule job to run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('Running abandoned cart cron job...');
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find carts not updated in last 24h, that have items, and no email sent yet.
    // Also, populate the user to get their email address.
    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: yesterday },
      'items.0': { $exists: true },
      abandonedEmailSent: false
    }).populate('user', 'email name');

    for (const cart of abandonedCarts) {
      if (cart.user && cart.user.email) {
        await sendAbandonedCartEmail(cart.user.email, cart.items, 'COMEBACK10');
        
        // Mark as sent so we don't spam them every hour
        cart.abandonedEmailSent = true;
        await cart.save();
      }
    }
    
    if (abandonedCarts.length > 0) {
      console.log(`Processed ${abandonedCarts.length} abandoned cart(s).`);
    }
  } catch (error) {
    console.error('Error in abandoned cart cron job:', error);
  }
});
