const path = require("path");
const fs = require("fs");

const Document = require("../models/Document");
const protectPdf = require("../utils/protectPdf");
const generatePdfPassword = require("../utils/generatePdfPassword");
const verifyPdfProtection = require("../utils/verifyPdfProtection");

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

    await protectPdf(
      document.originalPath,
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

module.exports = {
  protectDocument,
};