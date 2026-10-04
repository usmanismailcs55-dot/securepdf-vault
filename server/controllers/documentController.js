const path = require("path");
const fs = require("fs");
const os = require("os");

const Document = require("../models/Document");
const AccessLog = require("../models/AccessLog");

const protectPdf = require("../utils/protectPdf");
const verifyPdfProtection = require("../utils/verifyPdfProtection");
const { decryptBuffer } = require("../utils/fileEncryption");
const {
  uploadObject,
  downloadObject,
  deleteObject,
  objectExists,
} = require("../utils/b2Storage");
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


const getDocumentDetails = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      owner: req.user.userId,
      isDeleted: false,
    }).select(
      "_id originalFilename mimeType fileSize protectionStatus isPasswordProtected downloadCount lastDownloadedAt expiresAt createdAt updatedAt"
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });

  } catch (error) {
    next(error);
  }
};


const protectDocument = async (req, res, next) => {
  let document = null;
  let temporaryProtectedPath = null;
  let protectedObjectKey = null;

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

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "PDF password is required",
      });
    }

    if (!document.originalPath) {
      return res.status(404).json({
        success: false,
        message: "Original PDF file not found",
      });
    }

    document.protectionStatus = "processing";
    document.processingError = null;

    await document.save();

    /*
     * Download the encrypted original PDF from Backblaze B2.
     */
    const encryptedOriginal = await downloadObject(
      document.originalPath
    );

    /*
     * Decrypt the original PDF in memory.
     */
    const decryptedOriginal = decryptBuffer(
      encryptedOriginal
    );

    /*
     * protectPdf() requires an output file path.
     * Use the operating system temporary directory only while
     * processing the PDF.
     */
    temporaryProtectedPath = path.join(
      os.tmpdir(),
      `securepdf-protected-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.pdf`
    );

    /*
     * Create the password-protected PDF.
     */
    await protectPdf(
      decryptedOriginal,
      temporaryProtectedPath,
      password
    );

    /*
     * Verify that the generated PDF is actually protected.
     */
    const isProtected =
      await verifyPdfProtection(temporaryProtectedPath);

    if (!isProtected) {
      if (
        temporaryProtectedPath &&
        fs.existsSync(temporaryProtectedPath)
      ) {
        fs.unlinkSync(temporaryProtectedPath);
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

    /*
     * Read the verified protected PDF.
     */
    const protectedPdfBuffer =
      fs.readFileSync(temporaryProtectedPath);

    /*
     * Store the protected PDF in Backblaze B2.
     */
    protectedObjectKey =
      `protected/${document.storedFilename}`;

    await uploadObject(
      protectedObjectKey,
      protectedPdfBuffer,
      "application/pdf"
    );

    /*
     * Remove the temporary local protected PDF.
     */
    if (
      temporaryProtectedPath &&
      fs.existsSync(temporaryProtectedPath)
    ) {
      fs.unlinkSync(temporaryProtectedPath);
      temporaryProtectedPath = null;
    }

    /*
     * Update the document with the B2 protected object key.
     */
    document.protectedPath = protectedObjectKey;
    document.protectionStatus = "protected";
    document.isPasswordProtected = true;
    document.processingError = null;

    await document.save();

    /*
     * The encrypted original is no longer needed after
     * successful protection.
     */
    try {
      await deleteObject(document.originalPath);
    } catch (deleteError) {
      securityLog("B2_ORIGINAL_DELETE_FAILED", {
        documentId: document._id,
        objectKey: document.originalPath,
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "PDF protected successfully",
      documentId: document._id,
    });

  } catch (error) {

    /*
     * Remove any temporary local protected PDF.
     */
    if (
      temporaryProtectedPath &&
      fs.existsSync(temporaryProtectedPath)
    ) {
      fs.unlinkSync(temporaryProtectedPath);
    }

    /*
     * If the protected object was uploaded but processing
     * ultimately failed, remove the B2 object.
     */
    if (protectedObjectKey) {
      try {
        await deleteObject(protectedObjectKey);
      } catch (deleteError) {
        securityLog("B2_PROTECTED_DELETE_FAILED", {
          documentId: document?._id,
          objectKey: protectedObjectKey,
          error: deleteError.message,
        });
      }
    }

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

    if (!document) {
      const existingDocument =
        await Document.findOne({
          _id: documentId,
          isDeleted: false,
        });

      if (existingDocument) {
        const suspicious =
          await detectSuspiciousAccess({
            documentId: existingDocument._id,
            owner: existingDocument.owner,
            ipAddress: req.ip || null,
            userAgent: req.get("user-agent") || null,
            failureReason:
              "Unauthorized document access attempt",
          });

        if (suspicious) {
          securityLog(
            "SUSPICIOUS_DOCUMENT_ACCESS",
            {
              documentId,
              ipAddress: req.ip || null,
            }
          );
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

    const protectedExists =
      await objectExists(document.protectedPath);

    if (!protectedExists) {
      return res.status(404).json({
        success: false,
        message: "Protected PDF file not found",
      });
    }

    if (
      document.expiresAt &&
      new Date(document.expiresAt).getTime() <= Date.now()
    ) {
      return res.status(410).json({
        success: false,
        message: "Document has expired",
      });
    }

    document.downloadCount += 1;
    document.lastDownloadedAt = new Date();

    await document.save();

    await AccessLog.create({
      document: document._id,
      owner: document.owner,
      action: "download",
      ipAddress: req.ip || null,
      userAgent: req.get("user-agent") || null,
      success: true,
    });

    /*
     * Download the protected PDF from Backblaze B2.
     */
    const protectedPdf =
      await downloadObject(document.protectedPath);

    /*
     * Send the PDF directly to the client.
     */
    res.setHeader(
      "Content-Type",
      document.mimeType || "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        document.originalFilename
      )}"`
    );

    res.setHeader(
      "Content-Length",
      protectedPdf.length
    );

    return res.status(200).send(protectedPdf);

  } catch (error) {
    next(error);
  }
};


const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document =
      await Document.findOne({
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

    /*
     * Remove the original B2 object if it still exists.
     */
    if (document.originalPath) {
      try {
        await deleteObject(document.originalPath);
      } catch (error) {
        securityLog("B2_ORIGINAL_DELETE_FAILED", {
          documentId: document._id,
          objectKey: document.originalPath,
          error: error.message,
        });
      }
    }

    /*
     * Remove the protected B2 object if it exists.
     */
    if (document.protectedPath) {
      try {
        await deleteObject(document.protectedPath);
      } catch (error) {
        securityLog("B2_PROTECTED_DELETE_FAILED", {
          documentId: document._id,
          objectKey: document.protectedPath,
          error: error.message,
        });
      }
    }

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
  getDocumentDetails,
  protectDocument,
  downloadDocument,
  deleteDocument,
};