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
      user: req.user.userId,
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

/*
 * Step 125:
 * Prevent duplicate transaction hash reuse.
 */
router.post(
  "/submit-transaction",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        paymentReference,
        transactionHash,
      } = req.body;

      if (!paymentReference || !transactionHash) {
        return res.status(400).json({
          message:
            "Payment reference and transaction hash are required",
        });
      }

      const normalizedHash =
        transactionHash.trim().toLowerCase();

      const payment = await Payment.findOne({
        paymentReference,
        user: req.user.userId,
      });

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      /*
       * Check whether this transaction hash has already
       * been associated with another payment.
       */
      const existingPayment =
        await Payment.findOne({
          transactionHash: normalizedHash,
        });

      if (
        existingPayment &&
        existingPayment._id.toString() !==
          payment._id.toString()
      ) {
        return res.status(409).json({
          message:
            "This transaction has already been used for another payment.",
        });
      }

      /*
       * Prevent the same payment from being assigned
       * a different transaction after one has already
       * been submitted.
       */
      if (
        payment.transactionHash &&
        payment.transactionHash !== normalizedHash
      ) {
        return res.status(409).json({
          message:
            "A different transaction has already been submitted for this payment.",
        });
      }

      payment.transactionHash = normalizedHash;

      await payment.save();

      return res.status(200).json({
        message:
          "Transaction hash associated with payment.",
        paymentReference: payment.paymentReference,
        transactionHash: payment.transactionHash,
      });
    } catch (error) {
      /*
       * MongoDB unique-index protection.
       * This also protects against two requests arriving
       * at nearly the same time.
       */
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "This transaction has already been used.",
        });
      }

      console.error(
        "Submit transaction error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to submit transaction.",
      });
    }
  }
);

module.exports = router;