const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require("../middleware/authmiddleware");
const { protectDocument } = require("../controllers/documentController");

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

router.post(
  "/:documentId/protect",
  authMiddleware,
  protectDocument
);

module.exports = router;