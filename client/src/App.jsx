import { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
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

const API_URL =
  import.meta.env.VITE_API_URL || "https://localhost:5000/api";

function App() {
  const location = useLocation();

  const detailsSectionRef = useRef(null);
  const secureLinkSectionRef = useRef(null);
  const accessTokenRef = useRef(localStorage.getItem("accessToken"));

  const documentsRequestIdRef = useRef(0);
  const accessHistoryRequestIdRef = useRef(0);

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

  const [secureLinkDocumentId, setSecureLinkDocumentId] = useState(null);
  const [secureLinkRecipientEmail, setSecureLinkRecipientEmail] =
    useState("");
  const [secureLinkCreatePassword, setSecureLinkCreatePassword] =
    useState("");

  const [downloadLoadingId, setDownloadLoadingId] = useState(null);

  const [secureLinkToken, setSecureLinkToken] = useState("");
  const [secureLinkPassword, setSecureLinkPassword] = useState("");
  const [secureLinkLoading, setSecureLinkLoading] = useState(false);
  const [secureLinkAccessError, setSecureLinkAccessError] = useState("");

  const [subscriptionError, setSubscriptionError] = useState("");

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const handleLogin = (token) => {
    localStorage.setItem("accessToken", token);
    accessTokenRef.current = token;

    setAccessToken(token);

    setDocuments([]);
    setAccessHistory([]);
    setDocumentsError("");
    setAccessHistoryError("");
    setSubscriptionError("");
    setSelectedDocument(null);
    setDetailsError("");
    setSecureLinkData(null);
    setSecureLinkDocumentId(null);
    setSecureLinkError("");
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    accessTokenRef.current = null;

    setAccessToken(null);

    setDocuments([]);
    setDocumentsError("");
    setLoadingDocuments(false);

    setAccessHistory([]);
    setAccessHistoryError("");
    setAccessHistoryLoading(false);

    setSelectedDocument(null);
    setDetailsError("");
    setDetailsLoading(false);

    setSearchTerm("");
    setStatusFilter("all");

    setSecureLinkData(null);
    setSecureLinkDocumentId(null);
    setSecureLinkRecipientEmail("");
    setSecureLinkCreatePassword("");
    setSecureLinkError("");
    setSecureLinkLoadingId(null);

    setDownloadLoadingId(null);

    setSubscriptionError("");

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const loadDocuments = useCallback(
    async (tokenOverride) => {
      const currentToken = tokenOverride || accessTokenRef.current;

      if (!currentToken) {
        return;
      }

      const requestId = ++documentsRequestIdRef.current;

      setLoadingDocuments(true);
      setDocumentsError("");
      setSubscriptionError("");

      try {
        const response = await axios.get(
          `${API_URL}/documents?_refresh=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (accessTokenRef.current !== currentToken) {
          return;
        }

        if (requestId !== documentsRequestIdRef.current) {
          return;
        }

        setDocuments(response.data.documents || []);
      } catch (error) {
        if (accessTokenRef.current !== currentToken) {
          return;
        }

        if (requestId !== documentsRequestIdRef.current) {
          return;
        }

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
        if (
          accessTokenRef.current === currentToken &&
          requestId === documentsRequestIdRef.current
        ) {
          setLoadingDocuments(false);
        }
      }
    },
    [handleLogout]
  );

  const loadAccessHistory = useCallback(
    async (tokenOverride) => {
      const currentToken = tokenOverride || accessTokenRef.current;

      if (!currentToken) {
        return;
      }

      const requestId = ++accessHistoryRequestIdRef.current;

      setAccessHistoryLoading(true);
      setAccessHistoryError("");

      try {
        const response = await axios.get(
          `${API_URL}/documents/access-history?_refresh=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (accessTokenRef.current !== currentToken) {
          return;
        }

        if (requestId !== accessHistoryRequestIdRef.current) {
          return;
        }

        setAccessHistory(response.data.accessLogs || []);
      } catch (error) {
        if (accessTokenRef.current !== currentToken) {
          return;
        }

        if (requestId !== accessHistoryRequestIdRef.current) {
          return;
        }

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
        if (
          accessTokenRef.current === currentToken &&
          requestId === accessHistoryRequestIdRef.current
        ) {
          setAccessHistoryLoading(false);
        }
      }
    },
    [handleLogout]
  );

  const handleViewDetails = async (documentId) => {
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedDocument(null);

    const currentToken = accessTokenRef.current;

    if (!currentToken) {
      setDetailsLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (accessTokenRef.current !== currentToken) {
        return;
      }

      setSelectedDocument(response.data.document);
    } catch (error) {
      if (accessTokenRef.current !== currentToken) {
        return;
      }

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
      if (accessTokenRef.current === currentToken) {
        setDetailsLoading(false);
      }
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    const currentToken = accessTokenRef.current;

    if (!currentToken) {
      return;
    }

    setDeleteLoadingId(documentId);

    try {
      await axios.delete(`${API_URL}/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (accessTokenRef.current !== currentToken) {
        return;
      }

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
      if (accessTokenRef.current !== currentToken) {
        return;
      }

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
      if (accessTokenRef.current === currentToken) {
        setDeleteLoadingId(null);
      }
    }
  };

  const handleDownloadDocument = async (documentId) => {
    const currentToken = accessTokenRef.current;

    if (!currentToken) {
      return;
    }

    setDownloadLoadingId(documentId);

    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          responseType: "blob",
        }
      );

      if (accessTokenRef.current !== currentToken) {
        return;
      }

      const blobUrl = window.URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "protected-document.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      toast.success("Document downloaded successfully.");

      await loadDocuments(currentToken);
      await loadAccessHistory(currentToken);
    } catch (error) {
      if (accessTokenRef.current !== currentToken) {
        return;
      }

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
      if (accessTokenRef.current === currentToken) {
        setDownloadLoadingId(null);
      }
    }
  };

  const openSecureLinkForm = (documentId) => {
    setSecureLinkDocumentId(documentId);
    setSecureLinkRecipientEmail("");
    setSecureLinkCreatePassword("");
    setSecureLinkData(null);
    setSecureLinkError("");
  };

  const closeSecureLinkForm = () => {
    setSecureLinkDocumentId(null);
    setSecureLinkRecipientEmail("");
    setSecureLinkCreatePassword("");
    setSecureLinkError("");
  };

  const handleCreateSecureLink = async (event) => {
    event.preventDefault();

    if (!secureLinkDocumentId) {
      return;
    }

    const currentToken = accessTokenRef.current;

    if (!currentToken) {
      return;
    }

    setSecureLinkLoadingId(secureLinkDocumentId);
    setSecureLinkData(null);
    setSecureLinkError("");

    try {
      const response = await axios.post(
        `${API_URL}/secure-links/${secureLinkDocumentId}`,
        {
          recipientEmail: secureLinkRecipientEmail,
          password: secureLinkCreatePassword,
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (accessTokenRef.current !== currentToken) {
        return;
      }

      setSecureLinkData(response.data);
      setSecureLinkDocumentId(null);
      setSecureLinkRecipientEmail("");
      setSecureLinkCreatePassword("");

      toast.success("Secure link created successfully.");
    } catch (error) {
      if (accessTokenRef.current !== currentToken) {
        return;
      }

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
      if (accessTokenRef.current === currentToken) {
        setSecureLinkLoadingId(null);
      }
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
        response.data.secureLink?.accessToken ||
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
      setDocuments([]);
      setAccessHistory([]);
      setLoadingDocuments(false);
      setAccessHistoryLoading(false);
      return;
    }

    accessTokenRef.current = accessToken;

    loadDocuments(accessToken);
    loadAccessHistory(accessToken);
  }, [accessToken, loadDocuments, loadAccessHistory]);

  useEffect(() => {
    if (!selectedDocument) {
      return;
    }

    detailsSectionRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedDocument]);

  useEffect(() => {
    if (!secureLinkDocumentId) {
      return;
    }

    secureLinkSectionRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, [secureLinkDocumentId]);

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.originalFilename
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      document.protectionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalDocuments = documents.length;

  const protectedDocuments = documents.filter(
    (document) => document.protectionStatus === "protected"
  ).length;

  const failedDocuments = documents.filter(
    (document) => document.protectionStatus === "failed"
  ).length;

  const totalDownloads = documents.reduce(
    (total, document) =>
      total + (document.downloadCount || 0),
    0
  );

  return (
    <>
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
              <main className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
                <section>
                  <div className="w-full overflow-hidden">
                    <img
                      src="/images/noir-vault-hero.jpg"
                      alt="SecurePDF Vault"
                      className="block h-[420px] w-full object-cover object-center sm:h-[520px] lg:h-[650px]"
                    />
                  </div>

                  <div className="mt-10 border border-black bg-white p-7 sm:p-10 lg:p-14">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em]">
                      SecurePDF Vault
                    </p>

                    <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                      Private documents.
                      <br />
                      Protected access.
                    </h1>

                    <p className="mt-6 max-w-3xl text-base leading-7 sm:text-lg">
                      Upload your PDF documents, protect them with
                      passwords, and securely manage access from one
                      professional vault.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to="/register"
                        className="border border-black bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        Create Account
                      </Link>

                      <Link
                        to="/login"
                        className="border border-black bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        Sign In
                      </Link>
                    </div>
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
          path="/payment/crypto"
          element={
            <ProtectedRoute accessToken={accessToken}>
              <CryptoPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/secure-link"
          element={
            <div className="min-h-screen bg-white px-5 py-10 text-black sm:px-8">
              <main className="mx-auto max-w-xl">
                <section>
                  <div className="w-full overflow-hidden">
                    <img
                      src="/images/noir-vault-hero.jpg"
                      alt="SecurePDF Vault"
                      className="block h-64 w-full object-cover object-center"
                    />
                  </div>

                  <div className="mt-10 border border-black bg-white p-7 sm:p-9">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                      SecurePDF Vault
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                      Secure Link Access
                    </h1>

                    <p className="mt-4 leading-7">
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
                          className="mb-2 block text-sm font-bold uppercase tracking-[0.1em]"
                        >
                          Secure Link Token
                        </label>

                        <input
                          id="secure-link-token"
                          value={secureLinkToken}
                          onChange={(event) =>
                            setSecureLinkToken(event.target.value)
                          }
                          className="w-full border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="secure-link-password"
                          className="mb-2 block text-sm font-bold uppercase tracking-[0.1em]"
                        >
                          Password
                        </label>

                        <input
                          id="secure-link-password"
                          type="password"
                          value={secureLinkPassword}
                          onChange={(event) =>
                            setSecureLinkPassword(event.target.value)
                          }
                          className="w-full border border-black bg-white px-4 py-3 text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                          required
                        />
                      </div>

                      {secureLinkAccessError && (
                        <div
                          role="alert"
                          className="border border-black bg-white p-4 font-semibold text-black"
                        >
                          {secureLinkAccessError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={secureLinkLoading}
                        className="w-full border border-black bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed"
                      >
                        {secureLinkLoading
                          ? "Accessing..."
                          : "Access Document"}
                      </button>
                    </form>
                  </div>
                </section>
              </main>
            </div>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute accessToken={accessToken}>
              <div className="min-h-screen bg-white text-black">
                <main className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
                  <section className="mb-10">
                    <div className="w-full overflow-hidden">
                      <img
                        src="/images/noir-vault-hero.jpg"
                        alt="SecurePDF Vault"
                        className="block h-[360px] w-full object-cover object-center sm:h-[480px] lg:h-[600px]"
                      />
                    </div>
                  </section>

                  <section className="mb-8 border border-black bg-white">
                    <div className="p-7 sm:p-9 lg:p-11">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em]">
                        SecurePDF Vault
                      </p>

                      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                        Dashboard
                      </h1>

                      <p className="mt-4 max-w-3xl text-sm leading-7 sm:text-base">
                        Manage protected documents, downloads,
                        secure links, and access activity from one
                        professional vault.
                      </p>

                      <div className="mt-8">
                        <Link
                          to="/payment/crypto"
                          className="inline-flex border border-black bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          Manage Subscription
                        </Link>
                      </div>
                    </div>
                  </section>

                  {subscriptionError && (
                    <section
                      role="alert"
                      className="mb-8 border border-black bg-white p-5"
                    >
                      <p className="font-semibold text-black">
                        {subscriptionError}
                      </p>

                      <Link
                        to="/payment/crypto"
                        className="mt-4 inline-block border border-black bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        Go to Payment
                      </Link>
                    </section>
                  )}

                  <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="border border-black bg-white p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        Total Documents
                      </p>

                      <p className="mt-3 text-4xl font-bold">
                        {totalDocuments}
                      </p>
                    </div>

                    <div className="border border-black bg-white p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        Protected
                      </p>

                      <p className="mt-3 text-4xl font-bold">
                        {protectedDocuments}
                      </p>
                    </div>

                    <div className="border border-black bg-white p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        Failed
                      </p>

                      <p className="mt-3 text-4xl font-bold">
                        {failedDocuments}
                      </p>
                    </div>

                    <div className="border border-black bg-white p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        Downloads
                      </p>

                      <p className="mt-3 text-4xl font-bold">
                        {totalDownloads}
                      </p>
                    </div>
                  </section>

                  <section className="mb-8 border border-black bg-white">
                    <div className="border-b border-black px-6 py-5 sm:px-7">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                        Document Security
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Upload PDF
                      </h2>
                    </div>

                    <div className="p-6 sm:p-7">
                      <PdfUpload
                        accessToken={accessToken}
                        onUploadComplete={async (uploadedDocument) => {
                          if (!uploadedDocument) {
                            return;
                          }

                          documentsRequestIdRef.current += 1;

                          setLoadingDocuments(false);
                          setDocumentsError("");

                          setDocuments((currentDocuments) => [
                            uploadedDocument,
                            ...currentDocuments.filter(
                              (document) =>
                                document._id !== uploadedDocument._id
                            ),
                          ]);

                          await loadAccessHistory(accessToken);
                        }}
                      />
                    </div>
                  </section>

                  <section className="mb-8 border border-black bg-white">
                    <div className="border-b border-black px-6 py-5 sm:px-7">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                        Vault Controls
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Find Documents
                      </h2>
                    </div>

                    <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <label
                          htmlFor="document-search"
                          className="mb-2 block text-sm font-bold uppercase tracking-[0.1em]"
                        >
                          Search Documents
                        </label>

                        <input
                          id="document-search"
                          value={searchTerm}
                          onChange={(event) =>
                            setSearchTerm(event.target.value)
                          }
                          placeholder="Search by filename"
                          className="w-full border border-black bg-white px-4 py-3 text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="status-filter"
                          className="mb-2 block text-sm font-bold uppercase tracking-[0.1em]"
                        >
                          Status
                        </label>

                        <select
                          id="status-filter"
                          value={statusFilter}
                          onChange={(event) =>
                            setStatusFilter(event.target.value)
                          }
                          className="w-full border border-black bg-white px-4 py-3 text-black outline-none focus:border-black focus:ring-1 focus:ring-black md:w-auto"
                        >
                          <option value="all">All</option>
                          <option value="protected">
                            Protected
                          </option>
                          <option value="failed">Failed</option>
                          <option value="pending">Pending</option>
                          <option value="processing">
                            Processing
                          </option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8 border border-black bg-white">
                    <div className="border-b border-black px-6 py-5 sm:px-7">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                        Vault Contents
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Documents
                      </h2>
                    </div>

                    <div className="p-6 sm:p-7">
                      {documentsError && (
                        <div
                          role="alert"
                          className="mb-5 border border-black bg-white p-4 font-semibold text-black"
                        >
                          {documentsError}
                        </div>
                      )}

                      {loadingDocuments ? (
                        <div className="border border-black bg-white p-8 text-center">
                          <p className="font-semibold uppercase tracking-[0.1em]">
                            Loading documents...
                          </p>
                        </div>
                      ) : filteredDocuments.length === 0 ? (
                        <div className="border border-black bg-white p-8 text-center">
                          <p className="font-semibold uppercase tracking-[0.1em]">
                            No documents found.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredDocuments.map((document) => (
                            <div
                              key={document._id}
                              className="border border-black bg-white p-5 transition hover:bg-gray-50 sm:p-6"
                            >
                              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0">
                                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                                    PDF Document
                                  </p>

                                  <h3 className="break-all text-lg font-bold">
                                    {document.originalFilename}
                                  </h3>

                                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                                    <p>
                                      <span className="font-bold">
                                        Status:
                                      </span>{" "}
                                      {document.protectionStatus}
                                    </p>

                                    <p>
                                      <span className="font-bold">
                                        Downloads:
                                      </span>{" "}
                                      {document.downloadCount || 0}
                                    </p>

                                    <ExpirationStatus
                                      expiresAt={document.expiresAt}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 xl:max-w-xl xl:justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleViewDetails(document._id)
                                    }
                                    className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
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
                                    className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed"
                                  >
                                    {downloadLoadingId ===
                                    document._id
                                      ? "Downloading..."
                                      : "Download"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openSecureLinkForm(
                                        document._id
                                      )
                                    }
                                    disabled={
                                      secureLinkLoadingId ===
                                      document._id
                                    }
                                    className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed"
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
                                    className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed"
                                  >
                                    {deleteLoadingId ===
                                    document._id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {detailsLoading && (
                    <section className="mb-8 border border-black bg-white p-6">
                      <p className="font-semibold uppercase tracking-[0.1em]">
                        Loading document details...
                      </p>
                    </section>
                  )}

                  {detailsError && (
                    <section className="mb-8 border border-black bg-white p-6">
                      <p
                        role="alert"
                        className="font-semibold text-black"
                      >
                        {detailsError}
                      </p>
                    </section>
                  )}

                  {selectedDocument && (
                    <section
                      ref={detailsSectionRef}
                      className="mb-8 border border-black bg-white scroll-mt-24"
                    >
                      <div className="flex items-start justify-between gap-5 border-b border-black px-6 py-5 sm:px-7">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                            Document Record
                          </p>

                          <h2 className="mt-1 text-2xl font-bold">
                            Document Details
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDocument(null)
                          }
                          className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          Close
                        </button>
                      </div>

                      <div className="grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2 sm:p-7">
                        <p>
                          <span className="font-bold">
                            Filename:
                          </span>{" "}
                          {selectedDocument.originalFilename}
                        </p>

                        <p>
                          <span className="font-bold">
                            Status:
                          </span>{" "}
                          {selectedDocument.protectionStatus}
                        </p>

                        <p>
                          <span className="font-bold">
                            Password Protected:
                          </span>{" "}
                          {selectedDocument.isPasswordProtected
                            ? "Yes"
                            : "No"}
                        </p>

                        <p>
                          <span className="font-bold">
                            Downloads:
                          </span>{" "}
                          {selectedDocument.downloadCount || 0}
                        </p>

                        <p>
                          <span className="font-bold">
                            Last Downloaded:
                          </span>{" "}
                          {selectedDocument.lastDownloadedAt
                            ? new Date(
                                selectedDocument.lastDownloadedAt
                              ).toLocaleString()
                            : "Never"}
                        </p>

                        <p>
                          <span className="font-bold">
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

                  {secureLinkDocumentId && (
                    <section
                      ref={secureLinkSectionRef}
                      className="mb-8 border border-black bg-white scroll-mt-24"
                    >
                      <div className="flex items-start justify-between gap-5 border-b border-black px-6 py-5 sm:px-7">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                            Access Control
                          </p>

                          <h2 className="mt-1 text-2xl font-bold">
                            Create Secure Link
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={closeSecureLinkForm}
                          className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          Close
                        </button>
                      </div>

                      <form
                        onSubmit={handleCreateSecureLink}
                        className="space-y-5 p-6 sm:p-7"
                      >
                        <div>
                          <label
                            htmlFor="secure-link-recipient-email"
                            className="mb-2 block text-sm font-bold uppercase tracking-[0.1em]"
                          >
                            Recipient Email
                          </label>

                          <input
                            id="secure-link-recipient-email"
                            type="email"
                            value={secureLinkRecipientEmail}
                            onChange={(event) =>
                              setSecureLinkRecipientEmail(
                                event.target.value
                              )
                            }
                            placeholder="recipient@example.com"
                            className="w-full border border-black bg-white px-4 py-3 text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="secure-link-create-password"
                            className="mb-2 block text-sm font-bold uppercase tracking-[0.1em]"
                          >
                            Secure Link Password
                          </label>

                          <input
                            id="secure-link-create-password"
                            type="password"
                            value={secureLinkCreatePassword}
                            onChange={(event) =>
                              setSecureLinkCreatePassword(
                                event.target.value
                              )
                            }
                            placeholder="Enter a password"
                            className="w-full border border-black bg-white px-4 py-3 text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black"
                            required
                          />
                        </div>

                        {secureLinkError && (
                          <div
                            role="alert"
                            className="border border-black bg-white p-4 font-semibold text-black"
                          >
                            {secureLinkError}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={
                              secureLinkLoadingId ===
                              secureLinkDocumentId
                            }
                            className="border border-black bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black disabled:cursor-not-allowed"
                          >
                            {secureLinkLoadingId ===
                            secureLinkDocumentId
                              ? "Creating..."
                              : "Create Secure Link"}
                          </button>

                          <button
                            type="button"
                            onClick={closeSecureLinkForm}
                            className="border border-black bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  {secureLinkError && !secureLinkDocumentId && (
                    <section className="mb-8 border border-black bg-white p-6">
                      <p
                        role="alert"
                        className="font-semibold text-black"
                      >
                        {secureLinkError}
                      </p>
                    </section>
                  )}

                  {secureLinkData && (
                    <section className="mb-8 border border-black bg-white">
                      <div className="flex items-start justify-between gap-5 border-b border-black px-6 py-5 sm:px-7">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                            Access Control
                          </p>

                          <h2 className="mt-1 text-2xl font-bold">
                            Secure Link Created
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSecureLinkData(null)
                          }
                          className="border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          Close
                        </button>
                      </div>

                      <div className="space-y-4 p-6 sm:p-7">
                        <p className="font-bold">
                          Secure Link:
                        </p>

                        <div className="break-all border border-black bg-white p-4 text-sm text-black">
                          {secureLinkData.secureLink?.url ||
                            secureLinkData.url ||
                            "Secure link created."}
                        </div>

                        {secureLinkData.secureLink
                          ?.recipientEmail && (
                          <p>
                            <span className="font-bold">
                              Recipient:
                            </span>{" "}
                            {
                              secureLinkData.secureLink
                                .recipientEmail
                            }
                          </p>
                        )}

                        {secureLinkData.secureLink
                          ?.expiresAt && (
                          <p>
                            <span className="font-bold">
                              Expires:
                            </span>{" "}
                            {new Date(
                              secureLinkData.secureLink.expiresAt
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  <section className="border border-black bg-white">
                    <div className="border-b border-black px-6 py-5 sm:px-7">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em]">
                        Security Activity
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Access History
                      </h2>
                    </div>

                    <div className="p-6 sm:p-7">
                      {accessHistoryError && (
                        <div
                          role="alert"
                          className="mb-5 border border-black bg-white p-4 font-semibold text-black"
                        >
                          {accessHistoryError}
                        </div>
                      )}

                      {accessHistoryLoading ? (
                        <div className="border border-black bg-white p-8 text-center">
                          <p className="font-semibold uppercase tracking-[0.1em]">
                            Loading access history...
                          </p>
                        </div>
                      ) : accessHistory.length === 0 ? (
                        <div className="border border-black bg-white p-8 text-center">
                          <p className="font-semibold uppercase tracking-[0.1em]">
                            No access history found.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {accessHistory.map((entry, index) => (
                            <div
                              key={
                                entry._id ||
                                `${
                                  entry.document?._id || "document"
                                }-${index}`
                              }
                              className="border border-black bg-white p-4"
                            >
                              <div className="grid gap-2 sm:grid-cols-3">
                                <p>
                                  <span className="font-bold">
                                    Document:
                                  </span>{" "}
                                  {entry.document
                                    ?.originalFilename ||
                                    "Unknown"}
                                </p>

                                <p>
                                  <span className="font-bold">
                                    Action:
                                  </span>{" "}
                                  {entry.action || "Download"}
                                </p>

                                <p>
                                  <span className="font-bold">
                                    Date:
                                  </span>{" "}
                                  {entry.createdAt
                                    ? new Date(
                                        entry.createdAt
                                      ).toLocaleString()
                                    : "Unknown"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/secure/:token"
          element={<SecureLinkAccess />}
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
    </>
  );
}

export default App;