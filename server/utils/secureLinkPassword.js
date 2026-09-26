const bcrypt = require("bcrypt");

async function verifySecureLinkPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  verifySecureLinkPassword,
};