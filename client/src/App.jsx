import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import DashboardLayout from "./layouts/DashboardLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import PdfUpload from "./components/PdfUpload";
import { getDocuments } from "./services/documentService";

function Home() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold">
          SecurePDF Vault
        </h1>

        <p className="mt-2 text-slate-600">
          Secure your PDF documents with password protection.
        </p>
      </Card>
    </main>
  );
}

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDocuments();
        setDocuments(data);
      } catch (error) {
        setError(error.message || "Failed to load documents.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${
      units[index]
    }`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const protectedDocuments = documents.filter(
    (document) =>
      document.protectionStatus === "protected"
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your PDF documents and secure links.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-sm font-medium text-slate-500">
              Total Documents
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {documents.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-500">
              Protected PDFs
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {protectedDocuments.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-500">
              Secure Links
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              0
            </p>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-500">
              Downloads
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              0
            </p>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Protect a PDF
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Upload a PDF to securely password-protect it.
            </p>
          </div>

          <PdfUpload />
        </Card>

        {/* Documents Section */}
        <Card>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Your Documents
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Your uploaded documents will appear here.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                Loading documents...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading &&
            !error &&
            documents.length === 0 && (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <p className="font-medium text-slate-700">
                  No documents yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Upload your first PDF to get started.
                </p>
              </div>
            )}

          {/* Document List */}
          {!isLoading &&
            !error &&
            documents.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                {/* Header */}
                <div className="hidden grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
                  <span>Document</span>
                  <span>Size</span>
                  <span>Status</span>
                  <span>Uploaded</span>
                </div>

                {/* Documents */}
                <div className="divide-y divide-slate-200">
                  {documents.map((document) => (
                    <div
                      key={document._id}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-4 sm:items-center sm:gap-4"
                    >
                      {/* Filename */}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {document.originalFilename}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 sm:hidden">
                          {formatFileSize(document.fileSize)}
                        </p>
                      </div>

                      {/* Size */}
                      <p className="hidden text-sm text-slate-600 sm:block">
                        {formatFileSize(document.fileSize)}
                      </p>

                      {/* Status */}
                      <div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            document.protectionStatus ===
                            "protected"
                              ? "bg-green-100 text-green-700"
                              : document.protectionStatus ===
                                "failed"
                              ? "bg-red-100 text-red-700"
                              : document.protectionStatus ===
                                "processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {document.protectionStatus}
                        </span>
                      </div>

                      {/* Date */}
                      <p className="text-sm text-slate-600">
                        {formatDate(document.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Routes>
        {/* Public route */}
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Authentication routes */}
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
      </Routes>
    </div>
  );
}

export default App;