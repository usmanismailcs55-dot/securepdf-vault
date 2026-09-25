const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { revokeSession } = require("../services/sessionService");

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You have accessed a protected route",
    user: req.user,
  });
});

router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    await revokeSession(token);

    res.json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to revoke session",
    });
  }
});

module.exports = router;