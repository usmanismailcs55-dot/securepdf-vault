const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendSecurePdfLink({
  recipientEmail,
  secureUrl,
  expiresAt,
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: "Your Secure PDF Link",
    text: `You have received a secure PDF.

Open your document:
${secureUrl}

This link expires on:
${expiresAt.toISOString()}
`,
  });
}

module.exports = {
  sendSecurePdfLink,
};