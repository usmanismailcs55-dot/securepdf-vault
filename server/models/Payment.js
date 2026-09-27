const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    paymentType: {
      type: String,
      enum: ["crypto"],
      required: true,
      default: "crypto",
    },

    provider: {
      type: String,
      enum: ["trust_wallet"],
      required: true,
      default: "trust_wallet",
    },

    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    transactionHash: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    asset: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    receivingWallet: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired", "refunded"],
      default: "pending",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    failureReason: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
