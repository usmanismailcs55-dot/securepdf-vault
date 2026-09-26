import axios from "axios";

const API_URL = "http://localhost:5000/api/secure-links";

export const getSecureLinkStatus = async (documentId) => {
  const token = localStorage.getItem("accessToken");

  const response = await axios.get(
    `${API_URL}/${documentId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

