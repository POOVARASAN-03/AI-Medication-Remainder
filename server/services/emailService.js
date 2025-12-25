const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 */
const sendEmailWithResend = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️  No RESEND_API_KEY found, email not sent');
      return { success: false, method: "resend", error: "API key not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'MedRemind AI <poomurali3@gmail.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("RESEND ERROR:", error);
      return { success: false, method: "resend", error: error.message };
    }

    console.log(`✅ EMAIL SENT via Resend → ${to}`);
    return { success: true, method: "resend", messageId: data.id };

  } catch (error) {
    console.error("RESEND ERROR:", error);
    return { success: false, method: "resend", error: error.message };
  }
};

module.exports = { sendEmailWithResend };
