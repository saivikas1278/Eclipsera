const express = require('express');
const { getStorefrontConfig, updateStorefrontConfig } = require('../controllers/configController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

const { sendEmail } = require('../utils/sendEmail');

router.route('/storefront')
  .get(getStorefrontConfig)
  .put(protect, admin, updateStorefrontConfig);

router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please provide name, email, and message.' });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'eclipserapremium@gmail.com';
    sendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form email error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
