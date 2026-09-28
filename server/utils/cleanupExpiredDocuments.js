const path = require("path");
const Document = require("../models/Document");
const deleteFile = require("./deleteFile");

const uploadsDirectory = path.resolve(__dirname, "../uploads");
const protectedDirectory = path.resolve(__dirname, "../protected-pdfs");

const isSafeDocumentPath = (filePath, allowedDirectory) => {
  if (!filePath) return false;

  const resolvedPath = path.resolve(filePath);
  const relativePath = path.relative(allowedDirectory, resolvedPath);

  return (
    relativePath &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath)
  );
};

const cleanupExpiredDocuments = async () => {
  const expiredDocuments = await Document.find({
    expiresAt: { $ne: null, $lte: new Date() },
    isDeleted: false,
  });

  let cleanedCount = 0;

  for (const document of expiredDocuments) {
    if (isSafeDocumentPath(document.originalPath, uploadsDirectory)) {
      await deleteFile(document.originalPath);
    }

    if (isSafeDocumentPath(document.protectedPath, protectedDirectory)) {
      await deleteFile(document.protectedPath);
    }

    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();

    cleanedCount += 1;
  }

  return cleanedCount;
};

module.exports = cleanupExpiredDocuments;
