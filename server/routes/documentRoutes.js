const express = require("express");

const router = express.Router();

const multer = require("multer");

const upload = multer({
  dest: "uploads/",
});

router.post("/upload", upload.single("pdf"), (req, res) => {
  res.status(201).json({
  success: true,
  message: "PDF uploaded successfully",
  file: {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  },
});
});

module.exports = router;