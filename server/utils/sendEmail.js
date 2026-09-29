const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

if (process.env.NODE_ENV !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.error("Email configuration check failed.");
    } else {
      console.log("Email server is ready to send messages.");
    }
  });
}

module.exports = transporter;