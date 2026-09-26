const crypto = require("crypto");

function generatePdfPassword() {
  return crypto.randomBytes(32).toString("base64url");
}

module.exports = generatePdfPassword;