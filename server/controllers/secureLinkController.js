const SecureLink = require("../models/SecureLink");
const Document = require("../models/Document");

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

module.exports = {
  getSecureLinkStatus,
};

