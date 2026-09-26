const API_URL = "http://localhost:5000/api";

export const getDocuments = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

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
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch access history."
    );
  }

  return data.accessLogs;
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
    let message = "Failed to download document.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Response was not JSON
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename || "protected-document.pdf";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
};