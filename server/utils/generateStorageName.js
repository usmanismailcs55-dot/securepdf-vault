const crypto = require("crypto");

const generateStorageName = () => {
  return `${crypto.randomUUID()}.pdf`;
};

module.exports = generateStorageName;