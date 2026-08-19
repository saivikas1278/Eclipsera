const axios = require('axios');

/**
 * Sends an email using EmailJS REST API from the Node.js backend.
 * @param {Object} templateParams - Object containing template variables (e.g., { to_email: 'user@example.com', subject: 'Welcome', message: 'Hello!' })
 */
const sendEmailJS = async (templateParams) => {
  try {
    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, config);
    console.log('EmailJS Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('EmailJS Error:', error.response ? error.response.data : error.message);
  }
};

const sendOrderConfirmation = async (order, pdfBuffer) => {
  const customerName = order.user?.name || order.shippingAddress?.name || 'Guest';
  const customerEmail = order.user?.email || order.shippingAddress?.email;

  // Build detailed string for items early so it can be used for both emails
  const itemNames = order.orderItems?.map(item => `${item.qty || item.quantity || 1}x ${item.name}`).join(', ') || 'Items not specified';

  if (customerEmail) {
    await sendEmailJS({
      to_email: customerEmail,
      email: customerEmail, 
      to_name: customerName,
      name: customerName,
      subject: `Order Confirmation - Eclipsera (${itemNames.substring(0, 30)}${itemNames.length > 30 ? '...' : ''})`,
      message: `Thank you for your order! We've received your order for:

${itemNames}

Total: INR ${order.totalPrice}

We are getting it ready to ship!`,
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
  const adminEmail = process.env.ADMIN_EMAIL || 'eclipserapremium@gmail.com';
  await sendEmailJS({
    to_email: adminEmail,
    email: adminEmail,
    to_name: 'Admin',
    name: 'Admin',
    subject: `New Order Received! (${itemNames.substring(0, 30)}${itemNames.length > 30 ? '...' : ''})`,
    message: adminMessage,
  });
};

const sendAbandonedCartEmail = async (email, cartItems, discountCode) => {
  await sendEmailJS({
    to_email: email,
    email: email,
    to_name: 'Shopper',
    name: 'Shopper',
    subject: `You left something beautiful behind!`,
    message: `We noticed you left some beautiful items in your cart. Use code ${discountCode} at checkout for 10% off your entire order.`,
  });
};

module.exports = { sendEmailJS, sendOrderConfirmation, sendAbandonedCartEmail };
