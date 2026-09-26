const Document = require("../models/Document");

const protectDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    console.log("DEBUG documentId:", documentId);
    console.log("DEBUG userId:", req.user.userId);

    const document = await Document.findOne({
      _id: documentId,
    }).lean();

    console.log("DEBUG document:", document);

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

    return res.status(200).json({
      success: true,
      message: "Document protection process started",
      documentId: document._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protectDocument,
};