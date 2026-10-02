import { useState } from "react";
import { FileUp, FileText } from "lucide-react";

export default function PdfUpload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setMessage("");
    setError("");

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    if (!password) {
      setError("Please enter a PDF password.");
      return;
    }

    setIsUploading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError(
          "You are not authenticated. Please log in again."
        );
        return;
      }

      const formData = new FormData();

      formData.append("pdf", file);

      const uploadResponse = await fetch(
        "https://localhost:5000/api/documents/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setError(
          uploadData.message ||
            "Failed to upload PDF."
        );
        return;
      }

      const documentId =
        uploadData.document?.id;

      if (!documentId) {
        setError(
          "PDF uploaded, but document ID was not returned."
        );
        return;
      }

      setMessage(
        "PDF uploaded. Protecting your PDF..."
      );

      const protectResponse = await fetch(
        `https://localhost:5000/api/documents/${documentId}/protect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const protectData =
        await protectResponse.json();

      if (!protectResponse.ok) {
        setError(
          protectData.message ||
            "PDF was uploaded, but protection failed."
        );
        return;
      }

      setMessage(
        "PDF uploaded and protected successfully."
      );

      setFile(null);
      setPassword("");
    } catch (error) {
      console.error(
        "PDF processing error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-black">
            Upload PDF
          </h2>

          <p className="mt-1 text-sm text-black/55">
            Select a PDF document and create a password.
          </p>
        </div>

        <label
          htmlFor="pdf-file"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/20 bg-black/[0.02] px-6 py-10 text-center transition hover:border-black/60 hover:bg-black/[0.04]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black text-white">
            <FileUp size={26} />
          </div>

          <p className="mt-4 text-sm font-semibold text-black/75">
            Click to select a PDF
          </p>

          <p className="mt-1 text-xs text-black/50">
            PDF files only
          </p>

          <input
            id="pdf-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>

        {file && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.02] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white">
              <FileText size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-black/80">
                Selected PDF
              </p>

              <p className="truncate text-sm text-black/50">
                {file.name}
              </p>
            </div>
          </div>
        )}

        {file && (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-black/75">
              PDF Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password for PDF"
              disabled={isUploading}
              className="h-12 w-full rounded-xl border border-black/15 bg-black/[0.02] px-4 text-sm text-black outline-none placeholder:text-black/35 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/10"
            />
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-black/15 bg-black/[0.03] px-4 py-3 text-sm font-medium text-black/75">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-black/20 bg-black/[0.04] px-4 py-3 text-sm font-medium text-black/80">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || !password || isUploading}
          className="mt-5 w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/20"
        >
          {isUploading
            ? "Protecting PDF..."
            : "Upload PDF"}
        </button>
      </div>
    </div>
  );
}