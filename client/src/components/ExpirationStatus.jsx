const ExpirationStatus = ({ expiresAt }) => {
  if (!expiresAt) {
    return <span>No expiration</span>;
  }

  const expirationDate = new Date(expiresAt);
  const now = new Date();

  if (expirationDate <= now) {
    return <span>Expired</span>;
  }

  return <span>Active</span>;
};

export default ExpirationStatus;