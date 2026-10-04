const bcrypt = require("bcryptjs");

const SecureLink = require("../models/SecureLink");
const Document = require("../models/Document");

const {
  generateSecureToken,
  hashSecureToken,
} = require("../utils/secureToken");

const {
  downloadObject,
  objectExists,
} = require("../utils/b2Storage");

const { sendSecurePdfLink } = require("../services/emailService");

const SECURE_LINK_EXPIRATION_HOURS = 24;
const SECURE_ACCESS_TOKEN_EXPIRATION_MINUTES = 15;

const createSecureLink = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { recipientEmail, password } = req.body;

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

    if (document.protectionStatus !== "protected") {
      return res.status(400).json({
        success: false,
        message:
          "Document must be protected before creating a secure link",
      });
    }

    if (!document.protectedPath) {
      return res.status(400).json({
        success: false,
        message: "Protected PDF is not available",
      });
    }

    const protectedExists =
      await objectExists(document.protectedPath);

    if (!protectedExists) {
      return res.status(404).json({
        success: false,
        message: "Protected PDF is not available",
      });
    }

    const existingSecureLink = await SecureLink.findOne({
      document: document._id,
      owner: req.user.userId,
      isActive: true,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (existingSecureLink) {
      return res.status(409).json({
        success: false,
        message:
          "An active secure link already exists for this document",
      });
    }

    const { token, tokenHash } = generateSecureToken();

    const passwordHash = await bcrypt.hash(password, 12);

    const expiresAt = new Date(
      Date.now() +
        SECURE_LINK_EXPIRATION_HOURS * 60 * 60 * 1000
    );

    const secureLink = await SecureLink.create({
      document: document._id,
      owner: req.user.userId,
      tokenHash,
      recipientEmail,
      passwordHash,
      accessTokenHash: null,
      accessTokenExpiresAt: null,
      expiresAt,
      isActive: true,
      lastAccessedAt: null,
      accessCount: 0,
      revokedAt: null,
    });

    const secureLinkUrl =
      `${process.env.CLIENT_URL || "http://localhost:5173"}` +
      `/secure/${token}`;

    try {
      await sendSecurePdfLink({
        recipientEmail,
        secureUrl: secureLinkUrl,
        expiresAt,
      });
    } catch (emailError) {
      await SecureLink.deleteOne({
        _id: secureLink._id,
      });

      console.error(
        "Failed to send secure PDF link email:",
        emailError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Secure link could not be emailed. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Secure link created and emailed successfully",
      secureLink: {
        id: secureLink._id,
        url: secureLinkUrl,
        recipientEmail: secureLink.recipientEmail,
        expiresAt: secureLink.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get the current secure-link status for a document.
 */
const getSecureLinkStatus = async (req, res, next) => {
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

    const secureLink = await SecureLink.findOne({
      document: document._id,
      owner: req.user.userId,
    });

    if (!secureLink) {
      return res.status(200).json({
        success: true,
        status: "not_created",
        expiresAt: null,
        lastAccessedAt: null,
        accessCount: 0,
      });
    }

    let status = "active";

    if (secureLink.revokedAt) {
      status = "revoked";
    } else if (!secureLink.isActive) {
      status = "inactive";
    } else if (secureLink.expiresAt <= new Date()) {
      status = "expired";
    }

    return res.status(200).json({
      success: true,
      status,
      expiresAt: secureLink.expiresAt,
      lastAccessedAt: secureLink.lastAccessedAt,
      accessCount: secureLink.accessCount,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Verify a recipient's secure-link password.
 */
const accessSecureLink = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const tokenHash = hashSecureToken(token);

    const secureLink = await SecureLink.findOne({
      tokenHash,
    }).select("+passwordHash");

    if (!secureLink) {
      return res.status(404).json({
        success: false,
        message: "Secure link is invalid or no longer available",
      });
    }

    if (secureLink.revokedAt) {
      return res.status(410).json({
        success: false,
        message: "This secure link has been revoked",
      });
    }

    if (!secureLink.isActive) {
      return res.status(410).json({
        success: false,
        message: "This secure link is inactive",
      });
    }

    if (secureLink.expiresAt <= new Date()) {
      return res.status(410).json({
        success: false,
        message: "This secure link has expired",
      });
    }

    const document = await Document.findOne({
      _id: secureLink.document,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "The linked document is no longer available",
      });
    }

    if (document.protectionStatus !== "protected") {
      return res.status(400).json({
        success: false,
        message: "The linked document is not available",
      });
    }

    if (!document.protectedPath) {
      return res.status(400).json({
        success: false,
        message: "The protected PDF is not available",
      });
    }

    const protectedExists =
      await objectExists(document.protectedPath);

    if (!protectedExists) {
      return res.status(404).json({
        success: false,
        message: "The protected PDF file is not available",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      secureLink.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect secure-link password",
      });
    }

    const {
      token: accessToken,
      tokenHash: accessTokenHash,
    } = generateSecureToken();

    const accessTokenExpiresAt = new Date(
      Date.now() +
        SECURE_ACCESS_TOKEN_EXPIRATION_MINUTES * 60 * 1000
    );

    secureLink.accessTokenHash = accessTokenHash;
    secureLink.accessTokenExpiresAt =
      accessTokenExpiresAt;
    secureLink.lastAccessedAt = new Date();
    secureLink.accessCount += 1;

    await secureLink.save();

    return res.status(200).json({
      success: true,
      message: "Secure link access granted",
      document: {
        id: document._id,
        originalFilename: document.originalFilename,
      },
      secureLink: {
        accessToken,
        accessTokenExpiresAt,
        expiresAt: secureLink.expiresAt,
        accessCount: secureLink.accessCount,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Download a protected PDF using the temporary recipient access token.
 */
const downloadSecureLinkDocument = async (
  req,
  res,
  next
) => {
  try {
    const { token, accessToken } = req.body;

    const tokenHash = hashSecureToken(token);
    const accessTokenHash =
      hashSecureToken(accessToken);

    const secureLink = await SecureLink.findOne({
      tokenHash,
      accessTokenHash,
    });

    if (!secureLink) {
      return res.status(401).json({
        success: false,
        message: "Secure-link access is invalid",
      });
    }

    if (secureLink.revokedAt) {
      return res.status(410).json({
        success: false,
        message: "This secure link has been revoked",
      });
    }

    if (!secureLink.isActive) {
      return res.status(410).json({
        success: false,
        message: "This secure link is inactive",
      });
    }

    const now = new Date();

    if (secureLink.expiresAt <= now) {
      return res.status(410).json({
        success: false,
        message: "This secure link has expired",
      });
    }

    if (
      !secureLink.accessTokenExpiresAt ||
      secureLink.accessTokenExpiresAt <= now
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Secure-link access has expired. Please verify the password again.",
      });
    }

    const document = await Document.findOne({
      _id: secureLink.document,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "The linked document is no longer available",
      });
    }

    if (document.protectionStatus !== "protected") {
      return res.status(400).json({
        success: false,
        message: "The linked document is not available",
      });
    }

    if (!document.protectedPath) {
      return res.status(404).json({
        success: false,
        message: "The protected PDF file is not available",
      });
    }

    const protectedExists =
      await objectExists(document.protectedPath);

    if (!protectedExists) {
      return res.status(404).json({
        success: false,
        message: "The protected PDF file is not available",
      });
    }

    document.downloadCount += 1;
    document.lastDownloadedAt = new Date();

    await document.save();

    /*
     * Download the protected PDF from Backblaze B2.
     */
    const protectedPdf =
      await downloadObject(document.protectedPath);

    /*
     * Send the protected PDF directly to the recipient.
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


module.exports = {
  createSecureLink,
  getSecureLinkStatus,
  accessSecureLink,
  downloadSecureLinkDocument,
};
