const { hashSecureToken } = require("./secureToken");

function validateSecureToken(token, storedTokenHash) {
  const tokenHash = hashSecureToken(token);

  return tokenHash === storedTokenHash;
}

module.exports = {
  validateSecureToken,
};