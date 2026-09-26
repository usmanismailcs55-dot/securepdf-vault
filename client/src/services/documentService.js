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
    throw new Error(data.message || "Failed to fetch documents.");
  }

  return data.documents;
};