const mongoose = require("mongoose");

const paymentVerificationLogSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paymentReference: {
      type: String,
      required: true,
      index: true,
    },

    transactionHash: {
      type: String,
      default: null,
      index: true,
    },

    event: {
      type: String,
      enum: [
        "verification_started",
        "transaction_pending",
        "verification_success",
        "verification_failed",
        "underpayment",
        "overpayment",
      ],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      required: true,
    },

    details: {
      type: String,
      default: null,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PaymentVerificationLog",
  paymentVerificationLogSchema
);