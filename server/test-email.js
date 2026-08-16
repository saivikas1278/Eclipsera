const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const sendTestEmail = async () => {
  try {
    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: 'cheepusaivikas549@gmail.com',
        email: 'cheepusaivikas549@gmail.com',
        to_name: 'Admin Test',
        subject: 'EmailJS Configuration Test - IT WORKS!',
        message: 'Hello! If you are reading this, your EmailJS configuration is now perfectly set up and all your automated emails will work.'
      },
    };
    
    console.log("Sending with:", {
      service_id: data.service_id,
      template_id: data.template_id,
      user_id: data.user_id,
      accessToken: '***',
      template_params: data.template_params
    });

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Success!', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

sendTestEmail();
