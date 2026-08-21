const { sendEmail } = require('../utils/sendEmail');

const sendOrderConfirmation = async (order, pdfBuffer) => {
  const customerName = order.user?.name || order.shippingAddress?.name || 'Guest';
  const customerEmail = order.user?.email || order.shippingAddress?.email;

  // Build detailed string for items early so it can be used for both emails
  const itemNames = order.orderItems?.map(item => `${item.qty || item.quantity || 1}x ${item.name}`).join(', ') || 'Items not specified';

  if (customerEmail) {
    sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - Eclipsera (${itemNames.substring(0, 30)}${itemNames.length > 30 ? '...' : ''})`,
      text: `Thank you for your order! We've received your order for:\n\n${itemNames}\n\nTotal: INR ${order.totalPrice}\n\nWe are getting it ready to ship!`,
    });
  } else {
    console.warn(`No email found for order ${order._id}, skipping order confirmation email.`);
  }

  // Build detailed string for admin
  const address = order.shippingAddress 
    ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}\nPhone: ${order.shippingAddress.phone || 'Not provided'}` 
    : 'No address provided';

  const adminMessage = `A new order has been placed by ${customerName} for a total of INR ${order.totalPrice}.

ITEMS ORDERED:
${itemNames}

SHIPPING ADDRESS:
${address}

Please check the admin dashboard to fulfill it.`;

  // Send New Order Notification to Admin
  const adminEmail = 'eclipserapremium@gmail.com';
  sendEmail({
    to: adminEmail,
    subject: `New Order Received! (${itemNames.substring(0, 30)}${itemNames.length > 30 ? '...' : ''})`,
    text: adminMessage,
  });
};

const sendAbandonedCartEmail = async (email, cartItems, discountCode) => {
  sendEmail({
    to: email,
    subject: `You left something beautiful behind!`,
    text: `We noticed you left some beautiful items in your cart. Use code ${discountCode} at checkout for 10% off your entire order.`,
  });
};

module.exports = { sendOrderConfirmation, sendAbandonedCartEmail };
