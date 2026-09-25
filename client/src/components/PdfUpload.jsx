import { useState } from "react";
import { FileUp, FileText } from "lucide-react";

export default function PdfUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
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

        <button
          type="button"
          disabled={!file}
          className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Upload PDF
        </button>
      </div>
    </div>
  );
}