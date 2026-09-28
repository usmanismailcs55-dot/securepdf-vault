const express = require("express");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/uploadMiddleware");
const validatePdfSignature = require("../utils/validatePdf");
const generateStorageName = require("../utils/generateStorageName");
const { encryptBuffer } = require("../utils/fileEncryption");
const { securityLog } = require("../utils/securityLogger");

const Document = require("../models/Document");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "../uploads");

router.post(
  "/",
  authMiddleware,
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        securityLog("PDF_UPLOAD_REJECTED", {
          userId: req.user?.userId,
          reason: "No PDF file provided",
        });

        return res.status(400).json({
          success: false,
          message: "Please upload a PDF file.",
        });
      }

      // Verify the actual PDF signature
      if (!validatePdfSignature(req.file.buffer)) {
        securityLog("PDF_UPLOAD_REJECTED", {
          userId: req.user?.userId,
          filename: req.file.originalname,
          reason: "Invalid PDF signature",
        });

        return res.status(400).json({
          success: false,
          message: "Invalid PDF file.",
        });
      }

      // Make sure the upload directory exists
      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });

      // Generate a random storage filename
      const storageName = generateStorageName();

      const filePath = path.join(
        uploadDirectory,
        storageName
      );

      // Store the PDF
      fs.writeFileSync(
        filePath,
        encryptBuffer(req.file.buffer)
      );

      // Create document record
      const document = await Document.create({
        owner: req.user.userId,
        originalFilename: req.file.originalname,
        storedFilename: storageName,
        originalPath: filePath,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        protectionStatus: "pending",
        isPasswordProtected: false,
      });

      securityLog("PDF_UPLOAD_SUCCESS", {
        userId: req.user?.userId,
        documentId: document._id,
        filename: req.file.originalname,
        fileSize: req.file.size,
      });

      return res.status(201).json({
        success: true,
        message: "PDF uploaded successfully.",
        document: {
          id: document._id,
          originalFilename: document.originalFilename,
          filename: document.storedFilename,
          size: document.fileSize,
          mimeType: document.mimeType,
          protectionStatus: document.protectionStatus,
        },
      });
    } catch (error) {
      securityLog("PDF_UPLOAD_FAILED", {
        userId: req.user?.userId,
        reason: "Unexpected upload error",
        error: error.message,
      });

      return res.status(500).json({
        success: false,
        message: "Failed to upload PDF.",
      });
    }
  }
);

module.exports = router;
