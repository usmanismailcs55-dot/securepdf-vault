const express = require("express");

const router = express.Router();

const {
  createSecureLink,
  getSecureLinkStatus,
  accessSecureLink,
  downloadSecureLinkDocument,
} = require("../controllers/secureLinkController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  validate,
  schemas,
} = require("../middleware/validateInput");

// Access secure link as recipient
// IMPORTANT: This must come before /:documentId
// so "access" is not treated as a document ID.
router.post(
  "/access",
  validate(schemas.secureLinkAccess, "body"),
  accessSecureLink
);

// Download protected PDF using temporary recipient access token
router.post(
  "/download",
  validate(schemas.secureLinkDownload, "body"),
  downloadSecureLinkDocument
);

// Create secure link
router.post(
  "/:documentId",
  validate(schemas.documentId, "params"),
  validate(schemas.secureLink, "body"),
  authMiddleware,
  createSecureLink
);

// Get secure link status
router.get(
  "/:documentId/status",
  validate(schemas.documentId, "params"),
  authMiddleware,
  getSecureLinkStatus
);

module.exports = router;