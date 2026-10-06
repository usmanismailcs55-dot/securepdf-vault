import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://localhost:5000/api";

export const getSecureLinkStatus = async (documentId) => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.get(
    `${API_URL}/secure-links/${documentId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};