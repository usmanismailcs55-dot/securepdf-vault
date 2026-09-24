
require("dotenv").config();

const config = {
  jwtSecret: process.env.JWT_SECRET,
};

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

module.exports = config;

