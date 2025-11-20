const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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


/**
 * SEND WHATSAPP TEMPLATE MESSAGE (Quick Reply)
 * Template variables:
 * {{1}} = User Name
 * {{2}} = Slot (Morning/Afternoon/Evening/Night)
 * {{3}} = Medicine list for this slot
 */
const sendWhatsAppReminder = async (to, userName, slotName, medicineList) => {
  try {
    const from = process.env.TWILIO_WHATSAPP_NUMBER;
    const templateSid = process.env.TWILIO_TEMPLATE_SID;

    if (!from || !templateSid) {
      throw new Error("Missing TWILIO_WHATSAPP_NUMBER or TWILIO_TEMPLATE_SID");
    }

    if (!to.startsWith("whatsapp:")) {
      throw new Error("WhatsApp number must start with whatsapp:+");
    }

    const payload = {
      from,
      to,
      contentSid: templateSid,
      contentVariables: JSON.stringify({
        "1": userName,
        "2": slotName,
        "3": medicineList
      })
    };

    // 🔥 Universal Template API endpoint
    const message = await twilioClient.messages.create(payload);

    console.log(`WHATSAPP TEMPLATE SENT → ${to}`);
    return { success: true, method: "whatsapp", sid: message.sid };

  } catch (err) {
    console.error("WHATSAPP TEMPLATE ERROR:", err.message);
    return { success: false, method: "whatsapp", error: err.message };
  }
};




module.exports = { sendEmail, sendWhatsAppReminder };
