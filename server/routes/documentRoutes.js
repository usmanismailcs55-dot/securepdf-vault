const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getDocuments,
  getAccessHistory,
  protectDocument,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

const uploadRouter = require("./uploadRoutes");

// Upload PDF
router.use("/upload", uploadRouter);

// Get current user's documents
router.get("/", authMiddleware, getDocuments);

// Get current user's access history
router.get(
  "/access-history",
  authMiddleware,
  getAccessHistory
);

// Protect PDF
router.post(
  "/:documentId/protect",
  authMiddleware,
  protectDocument
);

// Download protected PDF
router.get(
  "/:documentId/download",
  authMiddleware,
  downloadDocument
);

// Delete document
router.delete(
  "/:documentId",
  authMiddleware,
  deleteDocument
);

module.exports = router;
