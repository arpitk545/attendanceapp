
// mailSender.js
require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

// Configure Brevo API key from .env
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const mailSender = async (to, subject, body) => {
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: body,
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return data;
  } catch (error) {
    console.error("Brevo email error:", error);
    throw error;
  }
};

module.exports = mailSender;
