import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CryptoPayment from "./pages/CryptoPayment";
import SecureLinkAccess from "./pages/SecureLinkAccess";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PdfUpload from "./components/PdfUpload";
import ExpirationStatus from "./components/ExpirationStatus";

const API_URL = "https://localhost:5000/api";

function App() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [accessHistory, setAccessHistory] = useState([]);
  const [accessHistoryLoading, setAccessHistoryLoading] = useState(false);
  const [accessHistoryError, setAccessHistoryError] = useState("");

  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [secureLinkLoadingId, setSecureLinkLoadingId] = useState(null);
  const [secureLinkData, setSecureLinkData] = useState(null);
  const [secureLinkError, setSecureLinkError] = useState("");

  const [downloadLoadingId, setDownloadLoadingId] = useState(null);

  const [secureLinkToken, setSecureLinkToken] = useState("");
  const [secureLinkPassword, setSecureLinkPassword] = useState("");
  const [secureLinkLoading, setSecureLinkLoading] = useState(false);
  const [secureLinkAccessError, setSecureLinkAccessError] = useState("");

  const [subscriptionError, setSubscriptionError] = useState("");

  const handleLogin = (token) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setDocuments([]);
    setSelectedDocument(null);
    setAccessHistory([]);
    setSecureLinkData(null);
    setSubscriptionError("");
  };

  const loadDocuments = async () => {
    if (!accessToken) {
      return;
    }

    setLoadingDocuments(true);
    setDocumentsError("");
    setSubscriptionError("");

    try {
      const response = await axios.get(`${API_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setDocuments(response.data.documents || []);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        setSubscriptionError(
          error.response.data?.message ||
            "An active subscription is required to access your documents."
        );
        setDocuments([]);
        return;
      }

      setDocumentsError(
        error.response?.data?.message ||
          "Failed to load documents."
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadAccessHistory = async () => {
    if (!accessToken) {
      return;
    }

    setAccessHistoryLoading(true);
    setAccessHistoryError("");

    try {
      const response = await axios.get(
        `${API_URL}/documents/access-history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setAccessHistory(response.data.history || []);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        setAccessHistoryError(
          error.response.data?.message ||
            "An active subscription is required to view access history."
        );
        return;
      }

      setAccessHistoryError(
        error.response?.data?.message ||
          "Failed to load access history."
      );
    } finally {
      setAccessHistoryLoading(false);
    }
  };

  const handleViewDetails = async (documentId) => {
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedDocument(null);

    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setSelectedDocument(response.data.document);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        setDetailsError(
          error.response.data?.message ||
            "An active subscription is required."
        );
        return;
      }

      setDetailsError(
        error.response?.data?.message ||
          "Failed to load document details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoadingId(documentId);

    try {
      await axios.delete(
        `${API_URL}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document._id !== documentId
        )
      );

      if (selectedDocument?._id === documentId) {
        setSelectedDocument(null);
      }

      toast.success("Document deleted successfully.");
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        setSubscriptionError(
          error.response.data?.message ||
            "An active subscription is required."
        );
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to delete document."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    setDownloadLoadingId(documentId);

    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(
        response.data
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "protected-document.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      toast.success("Document downloaded successfully.");
      await loadDocuments();
      await loadAccessHistory();
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        setSubscriptionError(
          error.response.data?.message ||
            "An active subscription is required."
        );
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to download document."
      );
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleCreateSecureLink = async (documentId) => {
    setSecureLinkLoadingId(documentId);
    setSecureLinkData(null);
    setSecureLinkError("");

    try {
      const response = await axios.post(
        `${API_URL}/secure-links`,
        {
          documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setSecureLinkData(response.data);
      toast.success("Secure link created successfully.");
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        setSubscriptionError(
          error.response.data?.message ||
            "An active subscription is required."
        );
        return;
      }

      setSecureLinkError(
        error.response?.data?.message ||
          "Failed to create secure link."
      );
    } finally {
      setSecureLinkLoadingId(null);
    }
  };

  const handleSecureLinkAccess = async (event) => {
    event.preventDefault();

    setSecureLinkAccessError("");
    setSecureLinkLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/secure-links/access`,
        {
          token: secureLinkToken,
          password: secureLinkPassword,
        }
      );

      const accessTokenFromLink =
        response.data.accessToken;

      if (!accessTokenFromLink) {
        throw new Error(
          "Secure link access token was not returned."
        );
      }

      window.location.href = `/secure-link/${secureLinkToken}/document/${accessTokenFromLink}`;
    } catch (error) {
      setSecureLinkAccessError(
        error.response?.data?.message ||
          error.message ||
          "Failed to access secure link."
      );
    } finally {
      setSecureLinkLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadDocuments();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadAccessHistory();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [accessToken]);

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.originalName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      document.protectionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalDocuments = documents.length;

  const protectedDocuments = documents.filter(
    (document) =>
      document.protectionStatus === "protected"
  ).length;

  const failedDocuments = documents.filter(
    (document) =>
      document.protectionStatus === "failed"
  ).length;

  const totalDownloads = documents.reduce(
    (total, document) =>
      total + (document.downloadCount || 0),
    0
  );

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Navbar
        accessToken={accessToken}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white text-black">
              <main className="mx-auto max-w-7xl px-6 py-16">
                <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
                  <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
                      SecurePDF Vault
                    </p>

                    <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
                      Secure your PDF documents with password protection.
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8">
                      Upload your PDF documents, protect them with
                      passwords, and securely manage access from one
                      dashboard.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <a
                        href="/register"
                        className="border border-black bg-black px-6 py-3 font-semibold text-white"
                      >
                        Create Account
                      </a>

                      <a
                        href="/login"
                        className="border border-black bg-white px-6 py-3 font-semibold text-black"
                      >
                        Sign In
                      </a>
                    </div>
                  </div>

                  <div className="border border-black p-8">
                    <img
                      src="/securepdf-vault.png"
                      alt="SecurePDF Vault"
                      className="mx-auto max-h-80 w-auto object-contain"
                    />
                  </div>
                </section>
              </main>
            </div>
          }
        />

        <Route
          path="/login"
          element={
            accessToken ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            accessToken ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          path="/crypto-payment"
          element={
            <ProtectedRoute accessToken={accessToken}>
              <CryptoPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secure-link"
          element={
            <div className="min-h-screen bg-white px-6 py-12 text-black">
              <div className="mx-auto max-w-xl border border-black p-8">
                <h1 className="text-3xl font-bold">
                  Secure Link Access
                </h1>

                <p className="mt-3">
                  Enter the secure link token and password to
                  access the document.
                </p>

                <form
                  onSubmit={handleSecureLinkAccess}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="secure-link-token"
                      className="mb-2 block font-semibold"
                    >
                      Secure Link Token
                    </label>

                    <input
                      id="secure-link-token"
                      value={secureLinkToken}
                      onChange={(event) =>
                        setSecureLinkToken(
                          event.target.value
                        )
                      }
                      className="w-full border border-black bg-white px-4 py-3 text-black"
                      required
                    />
                  </div>

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
                      value={secureLinkPassword}
                      onChange={(event) =>
                        setSecureLinkPassword(
                          event.target.value
                        )
                      }
                      className="w-full border border-black bg-white px-4 py-3 text-black"
                      required
                    />
                  </div>

                  {secureLinkAccessError && (
                    <div
                      role="alert"
                      className="border border-black p-3 font-semibold"
                    >
                      {secureLinkAccessError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={secureLinkLoading}
                    className="w-full border border-black bg-black px-4 py-3 font-semibold text-white disabled:cursor-not-allowed"
                  >
                    {secureLinkLoading
                      ? "Accessing..."
                      : "Access Document"}
                  </button>
                </form>
              </div>
            </div>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute accessToken={accessToken}>
              <div className="min-h-screen bg-white px-6 py-10 text-black">
                <main className="mx-auto max-w-7xl">
                  <div className="mb-10 flex flex-col gap-6 border-b border-black pb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                        SecurePDF Vault
                      </p>

                      <h1 className="mt-2 text-4xl font-bold">
                        Dashboard
                      </h1>
                    </div>

                    <a
                      href="/crypto-payment"
                      className="border border-black bg-black px-5 py-3 text-center font-semibold text-white"
                    >
                      Manage Subscription
                    </a>
                  </div>

                  {subscriptionError && (
                    <div
                      role="alert"
                      className="mb-8 border border-black p-5"
                    >
                      <p className="font-semibold">
                        {subscriptionError}
                      </p>

                      <a
                        href="/crypto-payment"
                        className="mt-4 inline-block border border-black bg-black px-5 py-3 font-semibold text-white"
                      >
                        Go to Payment
                      </a>
                    </div>
                  )}

                  <section className="mb-10 grid gap-5 md:grid-cols-4">
                    <div className="border border-black p-5">
                      <p className="text-sm font-semibold">
                        Total Documents
                      </p>
                      <p className="mt-2 text-3xl font-bold">
                        {totalDocuments}
                      </p>
                    </div>

                    <div className="border border-black p-5">
                      <p className="text-sm font-semibold">
                        Protected
                      </p>
                      <p className="mt-2 text-3xl font-bold">
                        {protectedDocuments}
                      </p>
                    </div>

                    <div className="border border-black p-5">
                      <p className="text-sm font-semibold">
                        Failed
                      </p>
                      <p className="mt-2 text-3xl font-bold">
                        {failedDocuments}
                      </p>
                    </div>

                    <div className="border border-black p-5">
                      <p className="text-sm font-semibold">
                        Downloads
                      </p>
                      <p className="mt-2 text-3xl font-bold">
                        {totalDownloads}
                      </p>
                    </div>
                  </section>

                  <section className="mb-10 border border-black p-6">
                    <h2 className="text-2xl font-bold">
                      Upload PDF
                    </h2>

                    <div className="mt-5">
                      <PdfUpload
                        accessToken={accessToken}
                        onUploadComplete={() => {
                          loadDocuments();
                          loadAccessHistory();
                        }}
                      />
                    </div>
                  </section>

                  <section className="mb-10 border border-black p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end">
                      <div className="flex-1">
                        <label
                          htmlFor="document-search"
                          className="mb-2 block font-semibold"
                        >
                          Search Documents
                        </label>

                        <input
                          id="document-search"
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(
                              event.target.value
                            )
                          }
                          placeholder="Search by filename"
                          className="w-full border border-black bg-white px-4 py-3 text-black"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="status-filter"
                          className="mb-2 block font-semibold"
                        >
                          Status
                        </label>

                        <select
                          id="status-filter"
                          value={statusFilter}
                          onChange={(event) =>
                            setStatusFilter(
                              event.target.value
                            )
                          }
                          className="border border-black bg-white px-4 py-3 text-black"
                        >
                          <option value="all">
                            All
                          </option>
                          <option value="protected">
                            Protected
                          </option>
                          <option value="failed">
                            Failed
                          </option>
                          <option value="pending">
                            Pending
                          </option>
                          <option value="processing">
                            Processing
                          </option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="mb-10 border border-black p-6">
                    <h2 className="text-2xl font-bold">
                      Documents
                    </h2>

                    {documentsError && (
                      <div
                        role="alert"
                        className="mt-5 border border-black p-4 font-semibold"
                      >
                        {documentsError}
                      </div>
                    )}

                    {loadingDocuments ? (
                      <p className="mt-5">
                        Loading documents...
                      </p>
                    ) : filteredDocuments.length === 0 ? (
                      <p className="mt-5">
                        No documents found.
                      </p>
                    ) : (
                      <div className="mt-5 space-y-5">
                        {filteredDocuments.map(
                          (document) => (
                            <div
                              key={document._id}
                              className="border border-black p-5"
                            >
                              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h3 className="break-all text-lg font-bold">
                                    {document.originalName}
                                  </h3>

                                  <p className="mt-2">
                                    Status:{" "}
                                    <span className="font-semibold">
                                      {
                                        document.protectionStatus
                                      }
                                    </span>
                                  </p>

                                  <p className="mt-1">
                                    Downloads:{" "}
                                    <span className="font-semibold">
                                      {
                                        document.downloadCount ||
                                        0
                                      }
                                    </span>
                                  </p>

                                  <ExpirationStatus
                                    expiresAt={
                                      document.expiresAt
                                    }
                                  />
                                </div>

                                <div className="flex flex-wrap gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewDetails(
                                        document._id
                                      )
                                    }
                                    className="border border-black bg-white px-4 py-2 font-semibold text-black"
                                  >
                                    Details
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadDocument(
                                        document._id
                                      )
                                    }
                                    disabled={
                                      downloadLoadingId ===
                                      document._id
                                    }
                                    className="border border-black bg-black px-4 py-2 font-semibold text-white disabled:cursor-not-allowed"
                                  >
                                    {downloadLoadingId ===
                                    document._id
                                      ? "Downloading..."
                                      : "Download"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCreateSecureLink(
                                        document._id
                                      )
                                    }
                                    disabled={
                                      secureLinkLoadingId ===
                                      document._id
                                    }
                                    className="border border-black bg-white px-4 py-2 font-semibold text-black disabled:cursor-not-allowed"
                                  >
                                    {secureLinkLoadingId ===
                                    document._id
                                      ? "Creating..."
                                      : "Secure Link"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteDocument(
                                        document._id
                                      )
                                    }
                                    disabled={
                                      deleteLoadingId ===
                                      document._id
                                    }
                                    className="border border-black bg-black px-4 py-2 font-semibold text-white disabled:cursor-not-allowed"
                                  >
                                    {deleteLoadingId ===
                                    document._id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </section>

                  {detailsLoading && (
                    <section className="mb-10 border border-black p-6">
                      <p>
                        Loading document details...
                      </p>
                    </section>
                  )}

                  {detailsError && (
                    <section className="mb-10 border border-black p-6">
                      <p
                        role="alert"
                        className="font-semibold"
                      >
                        {detailsError}
                      </p>
                    </section>
                  )}

                  {selectedDocument && (
                    <section className="mb-10 border border-black p-6">
                      <div className="flex items-start justify-between gap-5">
                        <h2 className="text-2xl font-bold">
                          Document Details
                        </h2>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDocument(null)
                          }
                          className="border border-black bg-white px-4 py-2 font-semibold text-black"
                        >
                          Close
                        </button>
                      </div>

                      <div className="mt-6 space-y-3">
                        <p>
                          <span className="font-semibold">
                            Filename:
                          </span>{" "}
                          {selectedDocument.originalName}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Status:
                          </span>{" "}
                          {selectedDocument.protectionStatus}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Password Protected:
                          </span>{" "}
                          {selectedDocument.isPasswordProtected
                            ? "Yes"
                            : "No"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Downloads:
                          </span>{" "}
                          {selectedDocument.downloadCount ||
                            0}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Last Downloaded:
                          </span>{" "}
                          {selectedDocument.lastDownloadedAt
                            ? new Date(
                                selectedDocument.lastDownloadedAt
                              ).toLocaleString()
                            : "Never"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Expires:
                          </span>{" "}
                          {selectedDocument.expiresAt
                            ? new Date(
                                selectedDocument.expiresAt
                              ).toLocaleString()
                            : "No expiration"}
                        </p>
                      </div>
                    </section>
                  )}

                  {secureLinkError && (
                    <section className="mb-10 border border-black p-6">
                      <p
                        role="alert"
                        className="font-semibold"
                      >
                        {secureLinkError}
                      </p>
                    </section>
                  )}

                  {secureLinkData && (
                    <section className="mb-10 border border-black p-6">
                      <div className="flex items-start justify-between gap-5">
                        <h2 className="text-2xl font-bold">
                          Secure Link Created
                        </h2>

                        <button
                          type="button"
                          onClick={() =>
                            setSecureLinkData(null)
                          }
                          className="border border-black bg-white px-4 py-2 font-semibold text-black"
                        >
                          Close
                        </button>
                      </div>

                      <div className="mt-6 space-y-4">
                        <p>
                          <span className="font-semibold">
                            Secure Link:
                          </span>
                        </p>

                        <div className="break-all border border-black p-4">
                          {secureLinkData.secureLink ||
                            secureLinkData.link ||
                            "Secure link created."}
                        </div>

                        {secureLinkData.expiresAt && (
                          <p>
                            <span className="font-semibold">
                              Expires:
                            </span>{" "}
                            {new Date(
                              secureLinkData.expiresAt
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  <section className="border border-black p-6">
                    <h2 className="text-2xl font-bold">
                      Access History
                    </h2>

                    {accessHistoryError && (
                      <div
                        role="alert"
                        className="mt-5 border border-black p-4 font-semibold"
                      >
                        {accessHistoryError}
                      </div>
                    )}

                    {accessHistoryLoading ? (
                      <p className="mt-5">
                        Loading access history...
                      </p>
                    ) : accessHistory.length === 0 ? (
                      <p className="mt-5">
                        No access history found.
                      </p>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {accessHistory.map(
                          (entry, index) => (
                            <div
                              key={
                                entry._id ||
                                `${entry.documentId}-${index}`
                              }
                              className="border border-black p-4"
                            >
                              <p>
                                <span className="font-semibold">
                                  Document:
                                </span>{" "}
                                {entry.documentName ||
                                  entry.originalName ||
                                  "Unknown"}
                              </p>

                              <p className="mt-1">
                                <span className="font-semibold">
                                  Action:
                                </span>{" "}
                                {entry.action ||
                                  "Download"}
                              </p>

                              <p className="mt-1">
                                <span className="font-semibold">
                                  Date:
                                </span>{" "}
                                {entry.createdAt
                                  ? new Date(
                                      entry.createdAt
                                    ).toLocaleString()
                                  : "Unknown"}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </section>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/secure-link/:token"
          element={<SecureLinkAccess />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
