import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL || "https://localhost:5000/api";

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

      const accessToken =
        accessResponse.data?.secureLink?.accessToken;

      const originalFilename =
        accessResponse.data?.document?.originalFilename ||
        "protected-document.pdf";

      if (!accessToken) {
        throw new Error(
          "Secure link access token was not returned."
        );
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
          const text =
            await requestError.response.data.text();

          const data = JSON.parse(text);

          message =
            data.message ||
            data.error ||
            message;
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

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* STANDALONE IMAGE */}
        <div className="w-full overflow-hidden border border-black bg-white">
          <img
            src="/images/noir-vault-hero.jpg"
            alt="SecurePDF Vault"
            className="h-[280px] w-full object-cover object-center grayscale sm:h-[360px] lg:h-[420px]"
          />
        </div>

        {/* ACCESS CONTENT */}
        <section className="mx-auto w-full max-w-2xl">
          <div className="border border-black bg-white p-6 sm:p-8">
            <div className="text-center">
              <h1 className="font-serif text-3xl text-black sm:text-4xl">
                Secure PDF Access
              </h1>

              <p className="mt-3 text-sm leading-6 text-black sm:text-base">
                Enter the password provided by the document
                owner to access this protected PDF.
              </p>
            </div>

            <form
              onSubmit={handleAccess}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="secure-link-password"
                  className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.28em] text-black"
                >
                  Password
                </label>

                <input
                  id="secure-link-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter PDF password"
                  autoComplete="off"
                  disabled={loading}
                  className="h-12 w-full border border-black bg-white px-4 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-white"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="border border-black bg-white p-4 text-sm leading-6 text-black"
                >
                  {error}
                </div>
              )}

              {downloaded && (
                <div
                  role="status"
                  className="border border-black bg-white p-4 text-sm leading-6 text-black"
                >
                  <p className="font-semibold">
                    Download completed.
                  </p>

                  {documentName && (
                    <p className="mt-1">
                      File: {documentName}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full border border-black bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
              >
                {loading
                  ? "Accessing PDF..."
                  : "Access PDF"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default SecureLinkAccess;