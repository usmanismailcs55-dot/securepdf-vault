const path = require("path");
const fs = require("fs");

const Document = require("../models/Document");
const protectPdf = require("../utils/protectPdf");
const generatePdfPassword = require("../utils/generatePdfPassword");

const protectDocument = async (req, res, next) => {
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

    const protectedFilename = `protected-${document.storedFilename}`;

    const protectedPath = path.join(
      protectedDirectory,
      protectedFilename
    );

    await protectPdf(
      document.originalPath,
      protectedPath,
      password
    );

    document.protectedPath = protectedPath;
    document.protectionStatus = "protected";
    document.isPasswordProtected = true;

    await document.save();

    return res.status(200).json({
      success: true,
      message: "PDF protected successfully",
      documentId: document._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protectDocument,
};