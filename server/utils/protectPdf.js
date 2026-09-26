const fs = require("fs");
const { encryptPDF } = require("@pdfsmaller/pdf-encrypt");

async function protectPdf(inputPath, outputPath, password) {
  const pdfBytes = fs.readFileSync(inputPath);

  const encryptedPdf = await encryptPDF(
    new Uint8Array(pdfBytes),
    password,
    {
      ownerPassword: password,
      algorithm: "AES-256",
    }
  );

  fs.writeFileSync(outputPath, encryptedPdf);
}

module.exports = protectPdf;