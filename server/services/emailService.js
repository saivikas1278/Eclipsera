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

  if (!customerEmail) {
    console.warn(`No email found for order ${order._id}, skipping order confirmation email.`);
    return;
  }

  await sendEmailJS({
    to_email: customerEmail,
    email: customerEmail, // Send both to accommodate different template configurations
    to_name: customerName,
    name: customerName,
    subject: `Order Confirmation - Eclipsera #${order._id}`,
    message: `Thank you for your order! We've received your order #${order._id} for a total of INR ${order.totalPrice}. We are getting it ready to ship.`,
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
