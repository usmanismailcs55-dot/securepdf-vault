
const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { createSession } = require("../services/sessionService");
const generateVerificationToken = require("../utils/generateVerificationToken");
const transporter = require("../utils/sendEmail");

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// =========================
// REGISTER
// =========================
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const verificationToken = generateVerificationToken();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    });

    const verificationUrl = `http://localhost:5000/api/verify-email/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your SecurePDF Vault email",
      text: `Hello ${user.name},

Please verify your SecurePDF Vault email address by opening this link:

${verificationUrl}

This verification link expires in 24 hours.

If you did not create this account, you can ignore this email.`,
    });

    return res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended.",
      });
    }

    if (
      user.accountStatus === "locked" &&
      user.lockUntil &&
      user.lockUntil > new Date()
    ) {
      return res.status(423).json({
        message: "Account temporarily locked. Please try again later.",
      });
    }

    // Automatically clear an expired lock.
    if (
      user.accountStatus === "locked" &&
      (!user.lockUntil || user.lockUntil <= new Date())
    ) {
      user.accountStatus = "active";
      user.failedLoginAttempts = 0;
      user.lockUntil = null;

      await user.save();
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.accountStatus = "locked";
        user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);

        await user.save();

        return res.status(423).json({
          message:
            "Too many failed login attempts. Your account is temporarily locked.",
        });
      }

      await user.save();

      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.accountStatus = "active";
    user.lastLoginAt = new Date();

    await user.save();

    const accessToken = await createSession(user._id);

    return res.status(200).json({
      message: "Login successful.",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

