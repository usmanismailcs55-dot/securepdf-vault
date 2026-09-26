const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");

const {
  getDocuments,
  protectDocument,
} = require("../controllers/documentController");

const uploadRouter = require("./uploadRoutes");

// Upload PDF
router.use("/upload", uploadRouter);

// Get current user's documents
router.get("/", authMiddleware, getDocuments);

// Protect PDF
router.post(
  "/:documentId/protect",
  authMiddleware,
  protectDocument
);

module.exports = router;