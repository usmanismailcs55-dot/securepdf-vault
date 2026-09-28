const path = require("path");
const fs = require("fs");

const Document = require("../models/Document");
const AccessLog = require("../models/AccessLog");

const protectPdf = require("../utils/protectPdf");
const generatePdfPassword = require("../utils/generatePdfPassword");
const verifyPdfProtection = require("../utils/verifyPdfProtection");
const { decryptFile } = require("../utils/fileEncryption");
const { detectSuspiciousAccess } = require("../utils/suspiciousAccess");
const { securityLog } = require("../utils/securityLogger");

const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      owner: req.user.userId,
      isDeleted: false,
    })
      .select(
        "_id originalFilename fileSize protectionStatus isPasswordProtected downloadCount lastDownloadedAt expiresAt createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

const getAccessHistory = async (req, res, next) => {
  try {
    const accessLogs = await AccessLog.find({
      owner: req.user.userId,
    })
      .populate("document", "originalFilename")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      accessLogs,
    });
  } catch (error) {
    next(error);
  }
};

const protectDocument = async (req, res, next) => {
  let document = null;
  let protectedPath = null;

  try {
    const { documentId } = req.params;

    document = await Document.findOne({
      _id: documentId,
      owner: req.user.userId,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.protectionStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Document is not ready for protection",
      });
    }

    document.protectionStatus = "processing";
    document.processingError = null;
    await document.save();

    const password = generatePdfPassword();

    const protectedDirectory = path.join(
      __dirname,
      "..",
      "protected-pdfs"
    );

    fs.mkdirSync(protectedDirectory, { recursive: true });

    const protectedFilename = `protected-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.pdf`;

    protectedPath = path.join(
      protectedDirectory,
      protectedFilename
    );

    const decryptedOriginal = decryptFile(document.originalPath);

    await protectPdf(
      decryptedOriginal,
      protectedPath,
      password
    );

    // Verify that the generated PDF is actually protected
    const isProtected = await verifyPdfProtection(protectedPath);

    if (!isProtected) {
      if (fs.existsSync(protectedPath)) {
        fs.unlinkSync(protectedPath);
      }

      document.protectionStatus = "failed";
      document.processingError =
        "PDF protection verification failed";

      await document.save();

      return res.status(500).json({
        success: false,
        message: "PDF protection verification failed",
      });
    }

    // Delete the unprotected original PDF
    if (fs.existsSync(document.originalPath)) {
      fs.unlinkSync(document.originalPath);
    }

    document.protectedPath = protectedPath;
    document.protectionStatus = "protected";
    document.isPasswordProtected = true;
    document.processingError = null;

    await document.save();

    return res.status(200).json({
      success: true,
      message: "PDF protected successfully",
      documentId: document._id,
    });
  } catch (error) {
    // Clean up protected PDF if processing failed
    if (protectedPath && fs.existsSync(protectedPath)) {
      fs.unlinkSync(protectedPath);
    }

    // Mark document processing as failed
    if (document) {
      document.protectionStatus = "failed";
      document.processingError =
        error.message || "PDF processing failed";

      await document.save();
    }

    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      owner: req.user.userId,
      isDeleted: false,
    });

    // Detect attempts to access another user's document
    if (!document) {
      const existingDocument = await Document.findOne({
        _id: documentId,
        isDeleted: false,
      });

      if (existingDocument) {
        const suspicious = await detectSuspiciousAccess({
          documentId: existingDocument._id,
          owner: existingDocument.owner,
          ipAddress: req.ip || null,
          userAgent: req.get("user-agent") || null,
          failureReason: "Unauthorized document access attempt",
        });

        if (suspicious) {
          securityLog("SUSPICIOUS_DOCUMENT_ACCESS", {
            documentId,
            ipAddress: req.ip || null,
          });
        }
      }

      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.protectionStatus !== "protected") {
      return res.status(400).json({
        success: false,
        message: "Document is not protected yet",
      });
    }

    if (!document.protectedPath) {
      return res.status(404).json({
        success: false,
        message: "Protected PDF file not found",
      });
    }

    if (!fs.existsSync(document.protectedPath)) {
      return res.status(404).json({
        success: false,
        message: "Protected PDF file does not exist",
      });
    }

    // Check document expiration
    if (
      document.expiresAt &&
      new Date(document.expiresAt).getTime() <= Date.now()
    ) {
      return res.status(410).json({
        success: false,
        message: "Document has expired",
      });
    }

    // Update download statistics
    document.downloadCount += 1;
    document.lastDownloadedAt = new Date();

    await document.save();

    // Record download in access history
    await AccessLog.create({
      document: document._id,
      owner: document.owner,
      action: "download",
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      success: true,
    });

    return res.download(
      document.protectedPath,
      document.originalFilename,
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

// Delete document
const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      owner: req.user.userId,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Soft delete the document
    document.isDeleted = true;
    document.deletedAt = new Date();

    await document.save();

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  getAccessHistory,
  protectDocument,
  downloadDocument,
  deleteDocument,
};
