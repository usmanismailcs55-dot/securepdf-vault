const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const subscriptionMiddleware = require("../middleware/subscriptionMiddleware");

const {
  getDocuments,
  getAccessHistory,
  protectDocument,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

const uploadRouter = require("./uploadRoutes");

// Upload PDF
router.use(
  "/upload",
  authMiddleware,
  subscriptionMiddleware,
  uploadRouter
);

// Get current user's documents
router.get(
  "/",
  authMiddleware,
  subscriptionMiddleware,
  getDocuments
);

// Get current user's access history
router.get(
  "/access-history",
  authMiddleware,
  subscriptionMiddleware,
  getAccessHistory
);

// Protect PDF
router.post(
  "/:documentId/protect",
  authMiddleware,
  subscriptionMiddleware,
  protectDocument
);

// Download protected PDF
router.get(
  "/:documentId/download",
  authMiddleware,
  subscriptionMiddleware,
  downloadDocument
);

// Delete document
router.delete(
  "/:documentId",
  authMiddleware,
  subscriptionMiddleware,
  deleteDocument
);

module.exports = router;