const nodemailer = require('nodemailer');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * SEND EMAIL
 */
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`EMAIL SENT → ${to}`);
    return { success: true, method: "email" };

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return { success: false, method: "email", error: error.message };
  }
};

module.exports = { sendEmail };
