const jwt = require("jsonwebtoken");

const { findSessionByToken } = require("../services/sessionService");

const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    const session = await findSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid or has been revoked",
      });
    }

    const user = await User.findById(decoded.userId).select("sessionVersion");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    if (decoded.sessionVersion !== user.sessionVersion) {
      return res.status(401).json({
        success: false,
        message: "Session has been invalidated",
      });
    }

    req.user = decoded;
    req.session = session;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = authMiddleware;