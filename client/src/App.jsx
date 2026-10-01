import { useEffect, useState } from "react";
import {
  CheckCircle,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Circle,
  Download,
  History,
  Eye,
  X,
  Trash2,
  Link,
  Copy,
} from "lucide-react";
import {
  Routes,
  Route,
  useParams,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Card from "./components/Card";
import DashboardLayout from "./layouts/DashboardLayout";
import ExpirationStatus from "./components/ExpirationStatus";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CryptoPayment from "./pages/CryptoPayment";

import ProtectedRoute from "./components/ProtectedRoute";
import PdfUpload from "./components/PdfUpload";

import {
  getDocuments,
  getAccessHistory,
  getDocumentDetails,
  downloadDocument,
  deleteDocument,
  createSecureLink,
  accessSecureLink,
  downloadSecureLinkDocument,
} from "./services/documentService";


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


function SecureLinkAccess() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [document, setDocument] = useState(null);
  const [secureAccessToken, setSecureAccessToken] =
    useState("");
  const [error, setError] = useState("");

  const handleAccess = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setError("Please enter the secure-link password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await accessSecureLink(
        token,
        password
      );

      setDocument(data.document);
      setSecureAccessToken(
        data.secureLink.accessToken
      );
      setPassword("");
    } catch (error) {
      setError(
        error.message ||
          "Unable to access this secure link."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSecureDownload = async () => {
    if (!document || !secureAccessToken) {
      setError(
        "Secure-link download access is not available."
      );
      return;
    }

    setDownloading(true);
    setError("");

    try {
      await downloadSecureLinkDocument(
        token,
        secureAccessToken,
        document.originalFilename
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to download the protected PDF."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        {!document ? (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Link
                  size={24}
                  aria-hidden="true"
                />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-slate-900">
                Secure PDF Link
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Enter the secure-link password to access this protected PDF.
              </p>
            </div>

            <form
              onSubmit={handleAccess}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="secure-link-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Secure-link password
                </label>

                <input
                  id="secure-link-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  autoComplete="off"
                  disabled={loading}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Checking..."
                  : "Access Secure PDF"}
              </button>
            </form>

            <p className="mt-4 break-all text-xs text-slate-400">
              Secure link token: {token}
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle
                size={24}
                aria-hidden="true"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Access Granted
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              You have successfully accessed the secure link.
            </p>

            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Protected PDF
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                {document.originalFilename}
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              The secure-link password has been verified successfully.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSecureDownload}
              disabled={
                downloading || !secureAccessToken
              }
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Download
                size={17}
                aria-hidden="true"
              />

              {downloading
                ? "Downloading..."
                : "Download Protected PDF"}
            </button>
          </div>
        )}
      </Card>
    </main>
  );
}


function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accessHistory, setAccessHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [isDetailsLoading, setIsDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] = useState("");

  const [isCreatingSecureLink, setIsCreatingSecureLink] =
    useState(false);

  const [secureLinkError, setSecureLinkError] =
    useState("");

  const [secureLinkSuccess, setSecureLinkSuccess] =
    useState(null);

  const [recipientEmail, setRecipientEmail] =
    useState("");

  const [secureLinkPassword, setSecureLinkPassword] =
    useState("");


  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getDocuments();
      setDocuments(data);

      const history = await getAccessHistory();
      setAccessHistory(history);
    } catch (error) {
      setError(
        error.message || "Failed to load dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadDocuments();
  }, []);


  const handleDownload = async (document) => {
    try {
      setDownloadingId(document._id);
      setError("");

      await downloadDocument(
        document._id,
        document.originalFilename
      );

      await loadDocuments();
    } catch (error) {
      setError(
        error.message || "Failed to download document."
      );
    } finally {
      setDownloadingId(null);
    }
  };


  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteDocument(documentId);

      if (
        selectedDocument &&
        selectedDocument._id === documentId
      ) {
        setSelectedDocument(null);
        setSecureLinkSuccess(null);
        setSecureLinkError("");
      }

      await loadDocuments();
    } catch (error) {
      setError(
        error.message || "Failed to delete document."
      );
    }
  };


  const handleViewDetails = async (documentId) => {
    try {
      setIsDetailsLoading(true);
      setDetailsError("");

      setSecureLinkError("");
      setSecureLinkSuccess(null);

      setRecipientEmail("");
      setSecureLinkPassword("");

      setSelectedDocument(null);

      const document =
        await getDocumentDetails(documentId);

      setSelectedDocument(document);
    } catch (error) {
      setDetailsError(
        error.message || "Failed to load document details."
      );
    } finally {
      setIsDetailsLoading(false);
    }
  };


  const closeDetails = () => {
    setSelectedDocument(null);
    setDetailsError("");
    setIsDetailsLoading(false);

    setSecureLinkError("");
    setSecureLinkSuccess(null);

    setRecipientEmail("");
    setSecureLinkPassword("");
  };


  const handleCreateSecureLink = async () => {
    if (!selectedDocument) {
      return;
    }

    try {
      setIsCreatingSecureLink(true);
      setSecureLinkError("");
      setSecureLinkSuccess(null);

      const secureLink = await createSecureLink(
        selectedDocument._id,
        recipientEmail,
        secureLinkPassword
      );

      setSecureLinkSuccess(secureLink);

      setRecipientEmail("");
      setSecureLinkPassword("");
    } catch (error) {
      setSecureLinkError(
        error.message || "Failed to create secure link."
      );
    } finally {
      setIsCreatingSecureLink(false);
    }
  };


  const handleCopySecureLink = async () => {
    if (!secureLinkSuccess?.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        secureLinkSuccess.url
      );
    } catch {
      setSecureLinkError(
        "Unable to copy the secure link. Please copy it manually."
      );
    }
  };


  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 Bytes";
    }

    const units = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(2)} ${units[index]}`;
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };


  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };


  const protectedDocuments = documents.filter(
    (document) =>
      document.protectionStatus === "protected"
  );


  const totalDownloads = documents.reduce(
    (total, document) =>
      total + (document.downloadCount || 0),
    0
  );


  const filteredDocuments = documents.filter(
    (document) => {
      const matchesSearch =
        document.originalFilename
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        document.protectionStatus ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );


  const getProtectionStatus = (status) => {
    switch (status) {
      case "protected":
        return {
          label: "Protected",
          icon: CheckCircle2,
          className:
            "bg-green-100 text-green-700",
        };

      case "processing":
        return {
          label: "Processing",
          icon: Clock3,
          className:
            "bg-yellow-100 text-yellow-700",
        };

      case "failed":
        return {
          label: "Failed",
          icon: CircleAlert,
          className:
            "bg-red-100 text-red-700",
        };

      case "pending":
        return {
          label: "Pending",
          icon: Circle,
          className:
            "bg-slate-100 text-slate-700",
        };

      default:
        return {
          label: "Unknown",
          icon: Circle,
          className:
            "bg-slate-100 text-slate-700",
        };
    }
  };


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
              {totalDownloads}
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

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Your Documents
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Your uploaded documents will appear here.
              </p>
            </div>


            {/* Search and Filter */}
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              {/* Search */}
              <div className="w-full sm:w-64">

                <label
                  htmlFor="document-search"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Search documents
                </label>

                <input
                  id="document-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search by filename..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* Status Filter */}
              <div className="w-full sm:w-48">

                <label
                  htmlFor="status-filter"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Filter by status
                </label>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">
                    All Documents
                  </option>

                  <option value="protected">
                    Protected
                  </option>

                  <option value="processing">
                    Processing
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="failed">
                    Failed
                  </option>
                </select>

              </div>

            </div>

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


          {/* No Search/Filter Results */}
          {!isLoading &&
            !error &&
            documents.length > 0 &&
            filteredDocuments.length === 0 && (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">

                <p className="font-medium text-slate-700">
                  No matching documents
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or status filter.
                </p>

              </div>
            )}


          {/* Document List */}
          {!isLoading &&
            !error &&
            filteredDocuments.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">

                {/* Header */}
                <div className="hidden grid-cols-7 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">

                  <span>Document</span>
                  <span>Size</span>
                  <span>Status</span>
                  <span>Uploaded</span>
                  <span>Downloads</span>
                  <span>Expiration</span>
                  <span>Action</span>

                </div>


                {/* Documents */}
                <div className="divide-y divide-slate-200">

                  {filteredDocuments.map(
                    (document) => {

                      const status =
                        getProtectionStatus(
                          document.protectionStatus
                        );

                      const StatusIcon =
                        status.icon;

                      return (
                        <div
                          key={document._id}
                          className="grid gap-3 px-5 py-4 sm:grid-cols-7 sm:items-center sm:gap-4"
                        >

                          {/* Filename */}
                          <div className="min-w-0">

                            <p className="truncate font-medium text-slate-900">
                              {
                                document.originalFilename
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500 sm:hidden">
                              {formatFileSize(
                                document.fileSize
                              )}
                            </p>

                          </div>


                          {/* Size */}
                          <p className="hidden text-sm text-slate-600 sm:block">
                            {formatFileSize(
                              document.fileSize
                            )}
                          </p>


                          {/* Protection Status */}
                          <div>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                            >

                              <StatusIcon
                                size={14}
                                strokeWidth={2}
                                aria-hidden="true"
                              />

                              {status.label}

                            </span>

                          </div>


                          {/* Uploaded Date */}
                          <p className="text-sm text-slate-600">
                            {formatDate(
                              document.createdAt
                            )}
                          </p>


                          {/* Downloads */}
                          <div>

                            <p className="text-sm font-medium text-slate-700">
                              {
                                document.downloadCount ||
                                0
                              }
                            </p>

                            {document.lastDownloadedAt && (
                              <p className="mt-1 text-xs text-slate-500">
                                Last:{" "}
                                {formatDate(
                                  document.lastDownloadedAt
                                )}
                              </p>
                            )}

                          </div>


                          {/* Expiration Status */}
                          <div>
                            <ExpirationStatus
                              expiresAt={
                                document.expiresAt
                              }
                            />
                          </div>


                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  document._id
                                )
                              }
                              disabled={
                                isDetailsLoading
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                            >

                              <Eye
                                size={14}
                                aria-hidden="true"
                              />

                              Details

                            </button>


                            {document.protectionStatus ===
                              "protected" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    document
                                  )
                                }
                                disabled={
                                  downloadingId ===
                                  document._id
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >

                                <Download
                                  size={14}
                                  aria-hidden="true"
                                />

                                {downloadingId ===
                                document._id
                                  ? "Downloading..."
                                  : "Download"}

                              </button>

                            )}


                            {document.protectionStatus ===
                              "protected" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewDetails(
                                    document._id
                                  )
                                }
                                disabled={
                                  isDetailsLoading
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >

                                <Link
                                  size={14}
                                  aria-hidden="true"
                                />

                                Secure Link

                              </button>

                            )}


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  document._id
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >

                              <Trash2
                                size={14}
                                aria-hidden="true"
                              />

                              Delete

                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            )}

        </Card>


        {/* Document Details */}
        {(isDetailsLoading ||
          detailsError ||
          selectedDocument) && (

          <Card>

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-xl font-semibold text-slate-900">
                  Document Details
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Detailed information about the selected document.
                </p>

              </div>


              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close document details"
              >

                <X
                  size={20}
                  aria-hidden="true"
                />

              </button>

            </div>


            {isDetailsLoading && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">

                <p className="text-sm text-slate-500">
                  Loading document details...
                </p>

              </div>
            )}


            {!isDetailsLoading &&
              detailsError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

                  <p className="text-sm font-medium text-red-700">
                    {detailsError}
                  </p>

                </div>
              )}


            {!isDetailsLoading &&
              !detailsError &&
              selectedDocument && (

                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Filename
                      </p>

                      <p className="mt-1 break-words font-medium text-slate-900">
                        {
                          selectedDocument.originalFilename
                        }
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        File Size
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {formatFileSize(
                          selectedDocument.fileSize
                        )}
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        MIME Type
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          selectedDocument.mimeType
                        }
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Protection Status
                      </p>

                      <p className="mt-1 font-medium capitalize text-slate-900">
                        {
                          selectedDocument.protectionStatus
                        }
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Password Protected
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          selectedDocument.isPasswordProtected
                            ? "Yes"
                            : "No"
                        }
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Download Count
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          selectedDocument.downloadCount ||
                          0
                        }
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Uploaded
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {formatDateTime(
                          selectedDocument.createdAt
                        )}
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Last Updated
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {formatDateTime(
                          selectedDocument.updatedAt
                        )}
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Last Downloaded
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          selectedDocument.lastDownloadedAt
                            ? formatDateTime(
                                selectedDocument.lastDownloadedAt
                              )
                            : "Never"
                        }
                      </p>

                    </div>


                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Expiration
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          selectedDocument.expiresAt
                            ? formatDateTime(
                                selectedDocument.expiresAt
                              )
                            : "No expiration"
                        }
                      </p>

                    </div>

                  </div>


                  {/* Secure Link Creation */}
                  {selectedDocument.protectionStatus ===
                    "protected" && (

                    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

                      <div className="flex items-start gap-3">

                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">

                          <Link
                            size={20}
                            aria-hidden="true"
                          />

                        </div>

                        <div>

                          <h3 className="font-semibold text-slate-900">
                            Create Secure Link
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            Create a private 24-hour link for someone to access this protected PDF.
                          </p>

                        </div>

                      </div>


                      {!secureLinkSuccess && (

                        <div className="mt-5 space-y-4">

                          <div>

                            <label
                              htmlFor="secure-link-recipient-email"
                              className="mb-1 block text-sm font-medium text-slate-700"
                            >
                              Recipient Email
                            </label>

                            <input
                              id="secure-link-recipient-email"
                              type="email"
                              value={recipientEmail}
                              onChange={(event) =>
                                setRecipientEmail(
                                  event.target.value
                                )
                              }
                              placeholder="recipient@example.com"
                              maxLength={254}
                              disabled={
                                isCreatingSecureLink
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />

                          </div>


                          <div>

                            <label
                              htmlFor="secure-link-password"
                              className="mb-1 block text-sm font-medium text-slate-700"
                            >
                              Secure Link Password
                            </label>

                            <input
                              id="secure-link-password"
                              type="password"
                              value={secureLinkPassword}
                              onChange={(event) =>
                                setSecureLinkPassword(
                                  event.target.value
                                )
                              }
                              placeholder="Enter access password"
                              maxLength={128}
                              disabled={
                                isCreatingSecureLink
                              }
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                              The recipient will need this password to access the PDF.
                            </p>

                          </div>


                          {secureLinkError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">

                              <p className="text-sm font-medium text-red-700">
                                {
                                  secureLinkError
                                }
                              </p>

                            </div>
                          )}


                          <button
                            type="button"
                            onClick={
                              handleCreateSecureLink
                            }
                            disabled={
                              isCreatingSecureLink ||
                              !recipientEmail.trim() ||
                              !secureLinkPassword
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >

                            <Link
                              size={16}
                              aria-hidden="true"
                            />

                            {isCreatingSecureLink
                              ? "Creating..."
                              : "Create Secure Link"}

                          </button>

                        </div>
                      )}


                      {secureLinkSuccess && (

                        <div className="mt-5 space-y-4">

                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">

                            <p className="text-sm font-semibold text-green-700">
                              Secure link created successfully.
                            </p>

                            <p className="mt-1 text-xs text-green-700">
                              This link expires in 24 hours.
                            </p>

                          </div>


                          <div>

                            <label
                              htmlFor="generated-secure-link"
                              className="mb-1 block text-sm font-medium text-slate-700"
                            >
                              Secure Link
                            </label>

                            <div className="flex flex-col gap-2 sm:flex-row">

                              <input
                                id="generated-secure-link"
                                type="text"
                                value={
                                  secureLinkSuccess.url
                                }
                                readOnly
                                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                              />

                              <button
                                type="button"
                                onClick={
                                  handleCopySecureLink
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >

                                <Copy
                                  size={16}
                                  aria-hidden="true"
                                />

                                Copy

                              </button>

                            </div>

                          </div>


                          <div className="rounded-lg border border-slate-200 bg-white p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Recipient
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {
                                secureLinkSuccess.recipientEmail
                              }
                            </p>


                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Expires
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {formatDateTime(
                                secureLinkSuccess.expiresAt
                              )}
                            </p>

                          </div>


                          {secureLinkError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">

                              <p className="text-sm font-medium text-red-700">
                                {
                                  secureLinkError
                                }
                              </p>

                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </>
              )}

          </Card>
        )}


        {/* Access History */}
        <Card>

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">

              <History
                size={20}
                aria-hidden="true"
              />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-slate-900">
                Access History
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Recent activity on your protected documents.
              </p>

            </div>

          </div>


          {accessHistory.length === 0 ? (

            <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center">

              <p className="font-medium text-slate-700">
                No access history yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Download activity will appear here.
              </p>

            </div>

          ) : (

            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">

              {/* History Header */}
              <div className="hidden grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">

                <span>Document</span>
                <span>Action</span>
                <span>Status</span>
                <span>Date</span>

              </div>


              {/* History Items */}
              <div className="divide-y divide-slate-200">

                {accessHistory.map((log) => (

                  <div
                    key={log._id}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-4 sm:items-center sm:gap-4"
                  >

                    {/* Document */}
                    <div className="min-w-0">

                      <p className="truncate font-medium text-slate-900">
                        {
                          log.document?.originalFilename ||
                          "Unknown document"
                        }
                      </p>

                    </div>


                    {/* Action */}
                    <div>

                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                        {log.action}
                      </span>

                    </div>


                    {/* Status */}
                    <div>

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          log.success
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.success
                          ? "Successful"
                          : "Failed"}
                      </span>

                    </div>


                    {/* Date */}
                    <p className="text-sm text-slate-600">
                      {new Date(
                        log.createdAt
                      ).toLocaleString()}
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
        <Route
          path="/"
          element={<Home />}
        />


        {/* Secure link recipient route */}
        <Route
          path="/secure/:token"
          element={<SecureLinkAccess />}
        />


        {/* Crypto Payment route */}
        <Route
          path="/payment/crypto"
          element={<CryptoPayment />}
        />


        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

        </Route>


        {/* Authentication routes */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

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