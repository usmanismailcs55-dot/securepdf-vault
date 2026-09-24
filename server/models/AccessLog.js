const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    secureLink: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecureLink",
      default: null,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    action: {
      type: String,
      enum: ["view", "download", "failed"],
      required: true,
      index: true,
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    success: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model("AccessLog", accessLogSchema);