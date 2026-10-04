const Document = require("../models/Document");
const { deleteObject } = require("./b2Storage");

const cleanupExpiredDocuments = async () => {
  const expiredDocuments = await Document.find({
    expiresAt: { $ne: null, $lte: new Date() },
    isDeleted: false,
  });

  let cleanedCount = 0;

  for (const document of expiredDocuments) {
    if (document.originalPath) {
      try {
        await deleteObject(document.originalPath);
      } catch (error) {
        console.error(
          `Failed to delete original B2 object for document ${document._id}:`,
          error.message
        );
      }
    }

    if (document.protectedPath) {
      try {
        await deleteObject(document.protectedPath);
      } catch (error) {
        console.error(
          `Failed to delete protected B2 object for document ${document._id}:`,
          error.message
        );
      }
    }

    document.isDeleted = true;
    document.deletedAt = new Date();

    await document.save();

    cleanedCount += 1;
  }

  return cleanedCount;
};

module.exports = cleanupExpiredDocuments;