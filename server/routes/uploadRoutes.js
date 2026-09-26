const express = require("express");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/uploadMiddleware");
const validatePdfSignature = require("../utils/validatePdf");
const generateStorageName = require("../utils/generateStorageName");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "../../uploads");

router.post("/", upload.single("pdf"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF file.",
      });
    }

    // Verify the actual PDF signature
    if (!validatePdfSignature(req.file.buffer)) {
      return res.status(400).json({
        message: "Invalid PDF file.",
      });
    }

    // Make sure the upload directory exists
    fs.mkdirSync(uploadDirectory, {
      recursive: true,
    });

    // Generate a random storage filename
    const storageName = generateStorageName();

    const filePath = path.join(
      uploadDirectory,
      storageName
    );

    // Store the PDF
    fs.writeFileSync(filePath, req.file.buffer);

    return res.status(201).json({
      message: "PDF uploaded successfully.",
      filename: storageName,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      message: "Failed to upload PDF.",
    });
  }
});

module.exports = router;