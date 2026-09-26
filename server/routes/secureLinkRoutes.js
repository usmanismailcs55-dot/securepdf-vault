const express = require("express");
const router = express.Router();

const {
  getSecureLinkStatus,
} = require("../controllers/secureLinkController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/:documentId/status",
  authMiddleware,
  getSecureLinkStatus
);

module.exports = router;