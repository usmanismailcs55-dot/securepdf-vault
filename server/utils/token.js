
const jwt = require("jsonwebtoken");
const config = require("../config");

function generateAccessToken(userId) {
  return jwt.sign(
    { userId },
    config.jwtSecret,
    {
      expiresIn: "15m",
    }
  );
}

module.exports = {
  generateAccessToken,
};

