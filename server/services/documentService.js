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