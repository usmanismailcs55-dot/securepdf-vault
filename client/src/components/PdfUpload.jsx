import { useState } from "react";
import { FileUp, FileText } from "lucide-react";

export default function PdfUpload() {
  const [file, setFile] = useState(null);
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

    setIsUploading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("You are not authenticated. Please log in again.");
        return;
      }

      // Upload PDF
      const formData = new FormData();
      formData.append("pdf", file);

      const uploadResponse = await fetch(
        "http://localhost:5000/api/documents/upload",
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
        setError(uploadData.message || "Failed to upload PDF.");
        return;
      }

      const documentId = uploadData.document?.id;

      if (!documentId) {
        setError("PDF uploaded, but document ID was not returned.");
        return;
      }

      // Protect PDF
      setMessage("PDF uploaded. Protecting your PDF...");

      const protectResponse = await fetch(
        `http://localhost:5000/api/documents/${documentId}/protect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const protectData = await protectResponse.json();

      if (!protectResponse.ok) {
        setError(
          protectData.message ||
            "PDF was uploaded, but protection failed."
        );
        return;
      }

      setMessage("PDF uploaded and protected successfully.");
      setFile(null);
    } catch (error) {
      console.error("PDF processing error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Upload PDF
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a PDF document to protect.
          </p>
        </div>

        <label
          htmlFor="pdf-file"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FileUp size={26} />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Click to select a PDF
          </p>

          <p className="mt-1 text-xs text-slate-500">
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
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <FileText size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Selected PDF
              </p>

              <p className="truncate text-sm text-slate-500">
                {file.name}
              </p>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isUploading ? "Protecting PDF..." : "Upload PDF"}
        </button>
      </div>
    </div>
  );
}

