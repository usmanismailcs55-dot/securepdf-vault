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