const nodemailer = require('nodemailer');

const getTransporter = async () => {
  let transporter;
  if (!process.env.SMTP_HOST) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Using Ethereal Email for testing');
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendOrderConfirmation = async (order, pdfBuffer) => {
  try {
    const transporter = await getTransporter();

    const customerName = order.user?.name || order.shippingAddress?.name || 'Guest';
    const customerEmail = order.user?.email || order.shippingAddress?.email;

    if (!customerEmail) {
      console.warn(`No email found for order ${order._id}, skipping order confirmation email.`);
      return;
    }

    const mailOptions = {
      from: '"Eclipsera Orders" <no-reply@eclipsera.com>',
      to: customerEmail,
      subject: `Order Confirmation - Eclipsera #${order._id}`,
      text: `Thank you for your order, ${customerName}! Your invoice is attached.`,
      html: `
        <div style="font-family: sans-serif; color: #18181b; padding: 20px;">
          <h2 style="color: #d4af37;">Thank you for your Eclipsera order!</h2>
          <p>Hi ${customerName},</p>
          <p>We've received your order <strong>#${order._id}</strong> and are getting it ready to ship.</p>
          <p>Your official invoice is attached to this email as a PDF document.</p>
          <br/>
          <p>Best regards,<br/><strong>The Eclipsera Team</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-EP-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
    
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL (Ethereal): %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

const sendAbandonedCartEmail = async (email, cartItems, discountCode) => {
  try {
    const transporter = await getTransporter();
    
    let itemsHtml = cartItems.map(item => `<li>${item.name} - ${item.qty} x INR ${item.price.toFixed(2)}</li>`).join('');
    
    const mailOptions = {
      from: '"Eclipsera Support" <no-reply@eclipsera.com>',
      to: email,
      subject: `You left something beautiful behind!`,
      html: `
        <div style="font-family: sans-serif; color: #18181b; padding: 20px;">
          <h2 style="color: #d4af37;">Don't miss out on these items!</h2>
          <p>Hi there,</p>
          <p>We noticed you left some beautiful items in your Eclipsera cart. They are selling out fast!</p>
          <ul>${itemsHtml}</ul>
          <p>As a special treat, use code <strong>${discountCode}</strong> at checkout for 10% off your entire order.</p>
          <br/>
          <p>Best regards,<br/><strong>The Eclipsera Team</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Abandoned cart email sent: %s', info.messageId);
    
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL (Ethereal): %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
  }
};

module.exports = { sendOrderConfirmation, sendAbandonedCartEmail };
