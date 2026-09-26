function authorizeDocumentAccess(secureLink, documentId) {
  if (!secureLink) {
    return false;
  }

  if (!secureLink.isActive) {
    return false;
  }

  if (secureLink.document.toString() !== documentId.toString()) {
    return false;
  }

  if (secureLink.expiresAt <= new Date()) {
    return false;
  }

  if (secureLink.revokedAt) {
    return false;
  }

  return true;
}

module.exports = {
  authorizeDocumentAccess,
};