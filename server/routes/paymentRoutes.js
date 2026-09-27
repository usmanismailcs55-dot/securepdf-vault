const express = require("express");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({
        message: "Subscription plan is required",
      });
    }

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({
        message: "Invalid subscription plan",
      });
    }

    const amount = plan === "monthly" ? 5 : 50;

    const paymentReference = `SPV-${crypto.randomUUID()}`;

    const payment = await Payment.create({
      user: req.user._id,
      paymentType: "subscription",
      provider: "trust_wallet",
      paymentReference,
      amount,
      currency: "USD",
      asset: "USDT",
      status: "pending",
      subscriptionPlan: plan,
    });

    res.status(201).json({
      message: "Payment created",
      paymentId: payment._id,
      paymentReference: payment.paymentReference,
      amount: payment.amount,
      currency: payment.currency,
      asset: payment.asset,
      status: payment.status,
      subscriptionPlan: payment.subscriptionPlan,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    res.status(500).json({
      message: "Failed to create payment",
    });
  }
});

module.exports = router;