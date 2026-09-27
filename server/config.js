require("dotenv").config();

const config = {
  jwtSecret: process.env.JWT_SECRET,

  subscriptionPrice: 500,
  cryptocurrency: "USDT",
  network: "TRC20",
};

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

module.exports = config;