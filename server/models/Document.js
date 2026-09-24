const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    storedFilename: {
      type: String,
      required: true,
      unique: true,
    },

    originalPath: {
      type: String,
      required: true,
    },

    protectedPath: {
      type: String,
      default: null,
    },

    mimeType: {
      type: String,
      required: true,
      default: "application/pdf",
    },

    fileSize: {
      type: Number,
      required: true,
    },

    protectionStatus: {
      type: String,
      enum: ["pending", "processing", "protected", "failed"],
      default: "pending",
      index: true,
    },

    isPasswordProtected: {
      type: Boolean,
      default: false,
    },

    processingError: {
      type: String,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);