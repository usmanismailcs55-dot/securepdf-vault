function isLinkExpired(secureLink) {
  return secureLink.expiresAt <= new Date();
}

async function disableExpiredLink(secureLink) {
  if (isLinkExpired(secureLink)) {
    secureLink.isActive = false;
    await secureLink.save();

    return true;
  }

  return false;
}

module.exports = {
  isLinkExpired,
  disableExpiredLink,
};