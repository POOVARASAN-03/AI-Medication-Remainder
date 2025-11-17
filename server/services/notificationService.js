const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services or direct SMTP
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true, method: 'email' };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, method: 'email', error: error.message };
  }
};

const sendWhatsAppMessage = async (to, body) => {
  try {
    // Twilio WhatsApp numbers are typically in the format 'whatsapp:+1234567890'
    const from = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number
    if (!from || !to.startsWith('whatsapp:')) {
      console.error('Invalid Twilio WhatsApp FROM number or TO number format.');
      return { success: false, method: 'whatsapp', error: 'Invalid number format' };
    }

    await twilioClient.messages.create({
      from: from,
      to: to, // Ensure this is in 'whatsapp:+1234567890' format
      body: body,
    });
    console.log(`WhatsApp message sent to ${to}: ${body}`);
    return { success: true, method: 'whatsapp' };
  } catch (error) {
    console.error(`Error sending WhatsApp message to ${to}:`, error);
    return { success: false, method: 'whatsapp', error: error.message };
  }
};

module.exports = { sendEmail, sendWhatsAppMessage };
