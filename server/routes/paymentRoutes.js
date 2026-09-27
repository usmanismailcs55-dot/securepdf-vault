const express = require("express");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "A valid payment amount is required",
      });
    }

    const network = process.env.PAYMENT_NETWORK;
    const asset = process.env.PAYMENT_ASSET;
    const receivingWallet =
      process.env.PAYMENT_RECEIVING_WALLET;

    if (!network || !asset || !receivingWallet) {
      return res.status(500).json({
        message: "Crypto payment configuration is incomplete",
      });
    }

    const paymentReference = `SPV-${crypto.randomUUID()}`;

    const payment = await Payment.create({
      user: req.user._id,
      paymentType: "crypto",
      provider: "trust_wallet",
      paymentReference,
      amount,
      currency: asset,
      asset,
      receivingWallet,
      status: "pending",
    });

    res.status(201).json({
      message: "Crypto payment created",
      paymentId: payment._id,
      paymentReference: payment.paymentReference,
      amount: payment.amount,
      currency: payment.currency,
      asset: payment.asset,
      receivingWallet: payment.receivingWallet,
      status: payment.status,
      network,
    });
  } catch (error) {
    console.error("Create crypto payment error:", error);

    res.status(500).json({
      message: "Failed to create crypto payment",
    });
  }
});

module.exports = router;
