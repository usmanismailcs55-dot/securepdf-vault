import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://localhost:5000/api";

function SecureLinkAccess() {
const { token } = useParams();

const [password, setPassword] = useState("");
const [documentName, setDocumentName] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [downloaded, setDownloaded] = useState(false);

const handleAccess = async (event) => {
event.preventDefault();


if (!token) {
  setError("Invalid secure link.");
  return;
}

if (!password) {
  setError("Please enter the password.");
  return;
}

setLoading(true);
setError("");
setDownloaded(false);

try {
  const accessResponse = await axios.post(
    `${API_URL}/secure-links/access`,
    {
      token,
      password,
    }
  );

  const accessToken = accessResponse.data?.secureLink?.accessToken;
  const originalFilename =
    accessResponse.data?.document?.originalFilename ||
    "protected-document.pdf";

  if (!accessToken) {
    throw new Error("Secure link access token was not returned.");
  }

  setDocumentName(originalFilename);

  const downloadResponse = await axios.post(
    `${API_URL}/secure-links/download`,
    {
      token,
      accessToken,
    },
    {
      responseType: "blob",
    }
  );

  const blob = new Blob([downloadResponse.data], {
    type: "application/pdf",
  });

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = originalFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);

  setDownloaded(true);
  toast.success("PDF downloaded successfully.");
} catch (requestError) {
  let message = "Unable to access the secure link.";

  if (requestError.response?.data instanceof Blob) {
    try {
      const text = await requestError.response.data.text();
      const data = JSON.parse(text);

      message = data.message || data.error || message;
    } catch {
      message = "Unable to access the secure link.";
    }
  } else {
    message =
      requestError.response?.data?.message ||
      requestError.response?.data?.error ||
      requestError.message ||
      message;
  }

  setError(message);
  toast.error(message);
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen bg-white text-black"> <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6 py-12"> <div className="w-full rounded-2xl border border-black bg-white p-8"> <div className="mb-8 flex justify-center"> <img
           src="/securepdf-vault.png"
           alt="SecurePDF Vault"
           className="h-20 w-auto object-contain"
         /> </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold">Secure PDF Access</h1>

        <p className="mt-3 text-base">
          Enter the password provided by the document owner to access this
          protected PDF.
        </p>
      </div>

      <form onSubmit={handleAccess} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="secure-link-password"
            className="mb-2 block font-semibold"
          >
            Password
          </label>

          <input
            id="secure-link-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter PDF password"
            autoComplete="off"
            disabled={loading}
            className="w-full rounded-lg border border-black bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-black bg-white p-4 text-black"
          >
            {error}
          </div>
        )}

        {downloaded && (
          <div
            role="status"
            className="rounded-lg border border-black bg-white p-4 text-black"
          >
            <p className="font-semibold">Download completed.</p>

            {documentName && (
              <p className="mt-1">File: {documentName}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-black bg-black px-4 py-3 font-semibold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
        >
          {loading ? "Accessing PDF..." : "Access PDF"}
        </button>
      </form>
    </div>
  </div>
</div>

);
}

export default SecureLinkAccess;
