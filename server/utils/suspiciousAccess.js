const AccessLog = require("../models/AccessLog");

const FAILURE_WINDOW_MS = 10 * 60 * 1000;
const FAILURE_THRESHOLD = 5;

async function detectSuspiciousAccess({
  documentId,
  owner,
  ipAddress,
  userAgent,
  failureReason,
}) {
  const now = Date.now();

  const recentFailures = await AccessLog.countDocuments({
    document: documentId,
    owner,
    ipAddress: ipAddress || null,
    success: false,
    createdAt: {
      $gte: new Date(now - FAILURE_WINDOW_MS),
    },
  });

  const suspicious = recentFailures >= FAILURE_THRESHOLD;

  await AccessLog.create({
    document: documentId,
    owner,
    action: "failed",
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    success: false,
    failureReason,
  });

  return suspicious;
}

module.exports = {
  detectSuspiciousAccess,
};
