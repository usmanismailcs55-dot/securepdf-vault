const jwt = require("jsonwebtoken");

const config = require("../config");

function generateAccessToken(userId, sessionVersion) {
  return jwt.sign(
    {
      userId,
      sessionVersion,
    },
    config.jwtSecret,
    {
      expiresIn: "15m",
    }
  );
}

module.exports = {
  generateAccessToken,
};