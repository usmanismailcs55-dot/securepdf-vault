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
      enum: ["subscription", "crypto"],
      required: true,
    },

    provider: {
      type: String,
      enum: ["stripe", "trust_wallet"],
      required: true,
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
      default: null,
      uppercase: true,
      trim: true,
    },

    receivingWallet: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired", "refunded"],
      default: "pending",
      index: true,
    },

    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly"],
      default: null,
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