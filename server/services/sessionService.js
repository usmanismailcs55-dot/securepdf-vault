const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Session = require("../models/session");
const config = require("../config");

const createSession = async (userId) => {
  const sessionId = crypto.randomUUID();

  const token = jwt.sign(
    {
      userId,
      sessionId,
    },
    config.jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    user: userId,
    tokenHash,
    expiresAt,
  });

  return token;
};

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const findSessionByToken = async (token) => {
  const tokenHash = hashToken(token);

  return Session.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

const revokeSession = async (token) => {
  const tokenHash = hashToken(token);

  return Session.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      revokedAt: new Date(),
    },
    {
      new: true,
    }
  );
};

module.exports = {
  createSession,
  hashToken,
  findSessionByToken,
  revokeSession,
};