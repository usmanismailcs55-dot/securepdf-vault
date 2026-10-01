const API_URL = "https://localhost:5000/api";

export const getDocuments = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  console.log("Documents response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch documents."
    );
  }

  return data.documents;
};

export const getAccessHistory = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/documents/access-history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  console.log("Access history response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch access history."
    );
  }

  return data.accessLogs;
};

export const getDocumentDetails = async (documentId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/documents/${documentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  console.log("Document details response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch document details."
    );
  }

  return data.document;
};

export const downloadDocument = async (
  documentId,
  filename
) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/documents/${documentId}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    let data = {};

    try {
      data = await response.json();
    } catch {
      // Ignore JSON parsing failure.
    }

    throw new Error(
      data.message || "Failed to download document."
    );
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export const deleteDocument = async (documentId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/documents/${documentId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  console.log("Delete document response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete document."
    );
  }

  return data;
};

/**
 * Create a secure link for a protected document.
 */
export const createSecureLink = async (
  documentId,
  recipientEmail,
  password
) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/secure-links/${documentId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientEmail,
        password,
      }),
    }
  );

  const data = await response.json();

  console.log("Create secure link response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create secure link."
    );
  }

  return data.secureLink;
};

/**
 * Get the secure-link status for a document.
 */
export const getSecureLinkStatus = async (documentId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(
    `${API_URL}/secure-links/${documentId}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  console.log("Secure link status response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch secure link status."
    );
  }

  return data;
};

/**
 * Access a secure link as a recipient.
 */
export const accessSecureLink = async (
  token,
  password
) => {
  const response = await fetch(
    `${API_URL}/secure-links/access`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    }
  );

  const data = await response.json();

  console.log("Secure link access response:", data);

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to access secure link."
    );
  }

  return data;
};

/**
 * Download a protected PDF using the temporary
 * secure-link access token.
 */
export const downloadSecureLinkDocument = async (
  token,
  accessToken,
  filename
) => {
  const response = await fetch(
    `${API_URL}/secure-links/download`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        accessToken,
      }),
    }
  );

  if (!response.ok) {
    let data = {};

    try {
      data = await response.json();
    } catch {
      // Ignore JSON parsing failure.
    }

    throw new Error(
      data.message ||
        "Failed to download the secure PDF."
    );
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};