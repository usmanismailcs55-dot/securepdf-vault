const fs = require("fs");
const path = require("path");

function getProtectedPdfPath(filename) {
  const safeFilename = path.basename(filename);

  return path.join(
    process.cwd(),
    "protected-pdfs",
    safeFilename
  );
}

function protectedPdfExists(filename) {
  const filePath = getProtectedPdfPath(filename);

  return fs.existsSync(filePath);
}

module.exports = {
  getProtectedPdfPath,
  protectedPdfExists,
};