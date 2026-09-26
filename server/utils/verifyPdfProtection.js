const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const verifyPdfProtection = async (filePath) => {
  try {
    const pdfBytes = fs.readFileSync(filePath);

    // Try to load the PDF without a password.
    // A properly encrypted PDF should not be readable this way.
    await PDFDocument.load(pdfBytes);

    return false;
  } catch (error) {
    // Loading failure is expected for a password-protected PDF.
    return true;
  }
};

module.exports = verifyPdfProtection;