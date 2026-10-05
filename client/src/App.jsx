import { useEffect, useRef, useState } from "react";
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
  ShieldCheck,
  LockKeyhole,
  FileText,
  Search,
  ArrowRight,
  FileLock2,
  Activity,
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


// ============================================================
// HOME
// ============================================================

function Home() {
  return (
    <main className="min-h-screen bg-white text-black">

      {/* ==================================================
          CORE VISUAL
          STANDALONE PHOTOGRAPH — NO TEXT / NO OVERLAY
          ================================================== */}

      <section className="w-full bg-white">

        <div className="w-full overflow-hidden">

          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[60vh] min-h-[420px] w-full object-cover object-center grayscale sm:h-[70vh] lg:h-[78vh]"
          />

        </div>

      </section>


      {/* ==================================================
          HOMEPAGE CONTENT
          COMPLETELY SEPARATE FROM THE PHOTOGRAPH
          ================================================== */}

      <section className="w-full border-t border-black bg-white">

        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:py-24">

          <div className="max-w-3xl">

            <p className="text-[10px] uppercase tracking-[0.3em] text-black">
              SecurePDF Vault
            </p>

            <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.03em] text-black sm:text-5xl lg:text-6xl">
              Protect what must remain private.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-black">
              SecurePDF Vault protects sensitive PDF documents with controlled
              access, password protection, and private document distribution.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <a
                href="/register"
                className="inline-flex items-center gap-2 border border-black bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
              >
                Open Vault
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/login"
                className="inline-flex items-center gap-2 border border-black bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
              >
                Login
              </a>

            </div>

          </div>


          <div className="mt-16 grid gap-px border border-black bg-black sm:grid-cols-3">

            <div className="bg-white p-6">

              <ShieldCheck className="h-5 w-5 text-black" />

              <p className="mt-5 text-sm font-medium text-black">
                Private document security
              </p>

              <p className="mt-2 text-xs leading-6 text-black">
                Keep sensitive PDF documents protected and controlled.
              </p>

            </div>


            <div className="bg-white p-6">

              <LockKeyhole className="h-5 w-5 text-black" />

              <p className="mt-5 text-sm font-medium text-black">
                Password protection
              </p>

              <p className="mt-2 text-xs leading-6 text-black">
                Protect documents before they are distributed.
              </p>

            </div>


            <div className="bg-white p-6">

              <Link className="h-5 w-5 text-black" />

              <p className="mt-5 text-sm font-medium text-black">
                Controlled sharing
              </p>

              <p className="mt-2 text-xs leading-6 text-black">
                Share protected documents through secure access links.
              </p>

            </div>

          </div>

        </div>

      </section>


      <footer className="border-t border-black bg-white">

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-7 text-[9px] uppercase tracking-[0.2em] text-black sm:flex-row sm:items-center sm:justify-between sm:px-8">

          <span>
            SecurePDF Vault
          </span>

          <span>
            Private document security
          </span>

        </div>

      </footer>

    </main>
  );
}


// ============================================================
// SECURE LINK ACCESS
// ============================================================

function SecureLinkAccess() {
  const { token } = useParams();

  const [document, setDocument] = useState(null);
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(true);

  async function handleAccess(event) {
    event.preventDefault();

    if (!password.trim()) {
      setError("Please enter the password.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await accessSecureLink(
        token,
        password
      );

      setDocument(
        response?.document || null
      );

      setAccessToken(
        response?.secureLink?.accessToken || ""
      );

      setRequiresPassword(false);
    } catch (err) {
      setError(
        err?.message ||
          "This secure link is invalid, expired, or unavailable."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    if (!accessToken) {
      setError(
        "Please verify the secure-link password first."
      );
      return;
    }

    try {
      setIsDownloading(true);
      setError("");

      await downloadSecureLinkDocument(
        token,
        accessToken,
        document?.originalFilename ||
          "protected-document.pdf"
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to download this document."
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* STANDALONE PHOTOGRAPH */}

      <section className="w-full bg-white">

        <div className="w-full overflow-hidden">

          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[55vh] min-h-[420px] w-full object-cover object-center grayscale sm:h-[65vh] lg:h-[72vh]"
          />

        </div>

      </section>


      {/* CONTENT */}

      <section className="w-full border-t border-black bg-white">

        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">

          <Card className="w-full border-black bg-white text-black shadow-none">

            <div className="border-b border-black pb-6">

              <div className="flex items-center gap-3">

                <LockKeyhole className="h-5 w-5 text-black" />

                <div>

                  <p className="text-[10px] uppercase tracking-[0.28em] text-black">
                    Secure Access
                  </p>

                  <h1 className="mt-1 text-2xl font-medium text-black">
                    Private Document
                  </h1>

                </div>

              </div>


              <p className="mt-4 max-w-xl text-sm leading-6 text-black">
                This document has been shared through a controlled
                SecurePDF Vault access link.
              </p>

            </div>


            {isLoading ? (

              <div className="flex items-center gap-3 py-12 text-sm text-black">

                <Activity className="h-4 w-4 animate-pulse text-black" />

                Checking secure link...

              </div>

            ) : error ? (

              <div className="mt-6 border border-black bg-white p-5">

                <div className="flex items-start gap-3">

                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-black" />

                  <div>

                    <p className="text-sm font-medium text-black">
                      Secure access unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-black">
                      {error}
                    </p>

                  </div>

                </div>

              </div>

            ) : !document ? (

              <form
                onSubmit={handleAccess}
                className="space-y-5 pt-7"
              >

                <div>

                  <label
                    htmlFor="secure-link-password"
                    className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-black"
                  >
                    Document password
                  </label>

                  <input
                    id="secure-link-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    className="w-full border border-black bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black transition focus:border-black"
                    placeholder="Enter document password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />

                </div>


                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 border border-black bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed"
                >

                  {isLoading ? (
                    <Activity className="h-4 w-4 animate-pulse text-black" />
                  ) : (
                    <LockKeyhole className="h-4 w-4 text-black" />
                  )}

                  {isLoading
                    ? "Verifying..."
                    : "Access document"}

                </button>

              </form>

            ) : (

              <div className="space-y-7 pt-7">

                <div className="border border-black bg-white p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-black bg-white">

                      <FileText className="h-5 w-5 text-black" />

                    </div>


                    <div className="min-w-0">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-black">
                        Document
                      </p>

                      <p className="mt-2 break-all text-lg leading-7 text-black">
                        {document?.originalFilename ||
                          document?.filename ||
                          "Protected PDF"}
                      </p>

                    </div>

                  </div>


                  {document?.expiresAt && (

                    <div className="mt-5 border-t border-black pt-5">

                      <ExpirationStatus
                        expiresAt={
                          document.expiresAt
                        }
                      />

                    </div>

                  )}

                </div>


                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || !accessToken}
                  className="inline-flex w-full items-center justify-center gap-2 border border-black bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed"
                >

                  {isDownloading ? (
                    <Activity className="h-4 w-4 animate-pulse text-black" />
                  ) : (
                    <Download className="h-4 w-4 text-black" />
                  )}

                  {isDownloading
                    ? "Preparing document..."
                    : "Download protected PDF"}

                </button>


                <div className="border-t border-black pt-6">

                  <div className="flex items-start gap-3">

                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-black" />

                    <p className="text-xs leading-6 text-black">
                      Secure access has been verified. The download
                      uses a temporary access token and is available
                      only while that token remains valid.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </Card>

        </div>

      </section>


      <footer className="border-t border-black bg-white">

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-7 text-[9px] uppercase tracking-[0.2em] text-black sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <span>
            SecurePDF Vault
          </span>

          <span>
            Private document access
          </span>

        </div>

      </footer>

    </main>
  );
}


// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accessHistory, setAccessHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [downloadingId, setDownloadingId] = useState(null);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [isCreatingSecureLink, setIsCreatingSecureLink] =
    useState(false);

  const [secureLinkError, setSecureLinkError] = useState("");
  const [secureLinkSuccess, setSecureLinkSuccess] = useState(null);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [secureLinkPassword, setSecureLinkPassword] = useState("");

  const detailsSectionRef = useRef(null);
  const secureLinkSectionRef = useRef(null);
  const scrollTarget = useRef(null);


  async function loadDocuments() {
    try {

      setIsLoading(true);
      setError("");

      const [
        documentsResponse,
        historyResponse,
      ] = await Promise.all([
        getDocuments(),
        getAccessHistory(),
      ]);


      setDocuments(
        Array.isArray(documentsResponse)
          ? documentsResponse
          : documentsResponse?.documents || []
      );


      setAccessHistory(
        Array.isArray(historyResponse)
          ? historyResponse
          : historyResponse?.history || []
      );

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load your documents."
      );

    } finally {

      setIsLoading(false);

    }
  }


  useEffect(() => {
    loadDocuments();
  }, []);


  useEffect(() => {

    if (!scrollTarget.current) {
      return;
    }

    const target = scrollTarget.current;

    requestAnimationFrame(() => {

      if (target === "details") {

        detailsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }


      if (target === "secure-link") {

        secureLinkSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }


      scrollTarget.current = null;

    });

  }, [
    selectedDocument,
    secureLinkSuccess,
  ]);


  async function handleDownload(document) {

    try {

      setDownloadingId(document._id);

      await downloadDocument(
        document._id
      );

      await loadDocuments();

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to download this document."
      );

    } finally {

      setDownloadingId(null);

    }
  }


  async function handleDelete(documentId) {

    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }


    try {

      await deleteDocument(
        documentId
      );


      if (
        selectedDocument?._id ===
        documentId
      ) {

        setSelectedDocument(null);
        setSecureLinkSuccess(null);

      }


      await loadDocuments();

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete this document."
      );

    }
  }


  async function handleViewDetails(
    documentId,
    target = "details"
  ) {

    try {

      setIsDetailsLoading(true);
      setDetailsError("");
      setSecureLinkError("");
      setSecureLinkSuccess(null);

      scrollTarget.current = target;

      const response =
        await getDocumentDetails(
          documentId
        );


      setSelectedDocument(
        response?.document ||
          response
      );

    } catch (err) {

      setDetailsError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load document details."
      );

    } finally {

      setIsDetailsLoading(false);

    }
  }


  function closeDetails() {

    setSelectedDocument(null);
    setDetailsError("");
    setSecureLinkError("");
    setSecureLinkSuccess(null);
    setRecipientEmail("");
    setSecureLinkPassword("");

  }


  async function handleCreateSecureLink(
    event
  ) {

    event.preventDefault();

    if (!selectedDocument?._id) {
      return;
    }


    try {

      setIsCreatingSecureLink(true);
      setSecureLinkError("");
      setSecureLinkSuccess(null);


      const response =
        await createSecureLink(
          selectedDocument._id,
          recipientEmail,
          secureLinkPassword
        );


      setSecureLinkSuccess(
        response
      );

      setRecipientEmail("");
      setSecureLinkPassword("");

      scrollTarget.current =
        "secure-link";

    } catch (err) {

      setSecureLinkError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create secure link."
      );

    } finally {

      setIsCreatingSecureLink(false);

    }
  }


  async function handleCopySecureLink(
    url
  ) {

    try {

      await navigator.clipboard.writeText(
        url
      );

    } catch {

      window.prompt(
        "Copy the secure link:",
        url
      );

    }
  }


  function formatFileSize(bytes) {

    if (!bytes || bytes <= 0) {
      return "0 B";
    }


    const units = [
      "B",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );


    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;

  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }


    const date =
      new Date(value);


    if (Number.isNaN(
      date.getTime()
    )) {
      return "—";
    }


    return date.toLocaleDateString();
  }


  function formatDateTime(value) {

    if (!value) {
      return "—";
    }


    const date =
      new Date(value);


    if (Number.isNaN(
      date.getTime()
    )) {
      return "—";
    }


    return date.toLocaleString();
  }


  const protectedDocuments =
    documents.filter(
      (document) =>
        document.protectionStatus ===
        "protected"
    );


  const totalDownloads =
    documents.reduce(
      (total, document) =>
        total +
        Number(
          document.downloadCount || 0
        ),
      0
    );


  const filteredDocuments =
    documents.filter(
      (document) => {

        const filename =
          document.originalFilename ||
          document.filename ||
          "";


        const matchesSearch =
          filename
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );


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


  function getProtectionStatus(
    status
  ) {

    if (status === "protected") {

      return {
        label: "Protected",
        icon: CheckCircle2,
        classes:
          "border-black bg-white text-black",
      };

    }


    if (status === "processing") {

      return {
        label: "Processing",
        icon: Clock3,
        classes:
          "border-black bg-white text-black",
      };

    }


    if (status === "failed") {

      return {
        label: "Failed",
        icon: CircleAlert,
        classes:
          "border-black bg-white text-black",
      };

    }


    if (status === "pending") {

      return {
        label: "Pending",
        icon: Circle,
        classes:
          "border-black bg-white text-black",
      };

    }


    return {
      label: "Unknown",
      icon: Circle,
      classes:
        "border-black bg-white text-black",
    };

  }


  return (
    <main className="min-h-screen bg-white text-black">

      {/* STANDALONE PHOTOGRAPH */}

      <section className="w-full bg-white">

        <div className="w-full overflow-hidden">

          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[55vh] min-h-[420px] w-full object-cover object-center grayscale sm:h-[65vh] lg:h-[72vh]"
          />

        </div>

      </section>


      <DashboardLayout>

        <div className="space-y-7 bg-white pb-12 pt-12 text-black">

          {/* INTRO */}

          <section className="border-y border-black bg-white py-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <ShieldCheck className="h-5 w-5 text-black" />

                  <p className="text-[10px] uppercase tracking-[0.3em] text-black">
                    Private Document Registry
                  </p>

                </div>


                <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-black sm:text-4xl">
                  Your Vault
                </h1>


                <p className="mt-3 max-w-2xl text-sm leading-7 text-black">
                  Manage protected PDF documents, controlled downloads,
                  secure links, and access activity from one private archive.
                </p>

              </div>


              <div className="border border-black bg-white px-5 py-4">

                <p className="text-[9px] uppercase tracking-[0.25em] text-black">
                  Vault status
                </p>


                <div className="mt-2 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-black" />

                  <span className="text-sm text-black">
                    Operational
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* STATISTICS */}

          <section className="grid gap-px border border-black bg-black sm:grid-cols-2 xl:grid-cols-4">

            {[
              [
                "Total documents",
                documents.length,
                "Registered files",
              ],
              [
                "Protected PDFs",
                protectedDocuments.length,
                "Secured documents",
              ],
              [
                "Secure links",
                0,
                "Active distribution",
              ],
              [
                "Downloads",
                totalDownloads,
                "Document activity",
              ],
            ].map(
              ([label, value, description]) => (

                <div
                  key={label}
                  className="bg-white px-5 py-6"
                >

                  <p className="text-[9px] uppercase tracking-[0.24em] text-black">
                    {label}
                  </p>

                  <p className="mt-3 text-3xl font-medium text-black">
                    {value}
                  </p>

                  <p className="mt-2 text-xs text-black">
                    {description}
                  </p>

                </div>

              )
            )}

          </section>


          {/* PDF INTAKE */}

          <Card className="border-black bg-white text-black shadow-none">

            <div className="flex flex-col gap-5 border-b border-black pb-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <FileLock2 className="h-5 w-5 text-black" />

                  <p className="text-[9px] uppercase tracking-[0.28em] text-black">
                    Case Intake
                  </p>

                </div>


                <h2 className="mt-2 text-2xl font-medium text-black">
                  Protect a PDF
                </h2>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-black">
                  Upload a PDF document to begin the protection process.
                </p>

              </div>

            </div>


            <div className="pt-6">
              <PdfUpload />
            </div>

          </Card>


          {/* DOCUMENT REGISTRY */}

          <Card className="border-black bg-white text-black shadow-none">

            <div className="flex flex-col gap-5 border-b border-black pb-6 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <FileText className="h-5 w-5 text-black" />

                  <p className="text-[9px] uppercase tracking-[0.28em] text-black">
                    Case Files
                  </p>

                </div>


                <h2 className="mt-2 text-2xl font-medium text-black">
                  Your Documents
                </h2>


                <p className="mt-2 text-sm text-black">
                  Search, inspect, download, distribute, or remove your files.
                </p>

              </div>


              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />


                  <input
                    id="document-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search documents"
                    className="w-full border border-black bg-white py-3 pl-10 pr-4 text-sm text-black outline-none placeholder:text-black focus:border-black sm:w-64"
                  />

                </div>


                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
                >

                  <option
                    value="all"
                    className="bg-white text-black"
                  >
                    All statuses
                  </option>

                  <option
                    value="pending"
                    className="bg-white text-black"
                  >
                    Pending
                  </option>

                  <option
                    value="processing"
                    className="bg-white text-black"
                  >
                    Processing
                  </option>

                  <option
                    value="protected"
                    className="bg-white text-black"
                  >
                    Protected
                  </option>

                  <option
                    value="failed"
                    className="bg-white text-black"
                  >
                    Failed
                  </option>

                </select>

              </div>

            </div>


            <div className="pt-6">

              {isLoading ? (

                <div className="flex items-center justify-center gap-3 py-14 text-sm text-black">

                  <Activity className="h-5 w-5 animate-pulse text-black" />

                  Loading your documents...

                </div>

              ) : error ? (

                <div className="border border-black bg-white p-5 text-sm text-black">
                  {error}
                </div>

              ) : documents.length === 0 ? (

                <div className="border border-dashed border-black bg-white px-6 py-14 text-center">

                  <FileText className="mx-auto h-8 w-8 text-black" />

                  <p className="mt-4 text-sm text-black">
                    No documents have been added yet.
                  </p>

                  <p className="mt-2 text-xs text-black">
                    Upload a PDF above to create your first case file.
                  </p>

                </div>

              ) : filteredDocuments.length === 0 ? (

                <div className="border border-dashed border-black bg-white px-6 py-14 text-center">

                  <Search className="mx-auto h-8 w-8 text-black" />

                  <p className="mt-4 text-sm text-black">
                    No matching documents found.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {filteredDocuments.map(
                    (document) => {

                      const status =
                        getProtectionStatus(
                          document.protectionStatus
                        );

                      const StatusIcon =
                        status.icon;

                      const filename =
                        document.originalFilename ||
                        document.filename ||
                        "Untitled document";


                      return (

                        <div
                          key={document._id}
                          className="border border-black bg-white p-5 transition hover:bg-black hover:text-white"
                        >

                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-3">

                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black">
                                  CASE
                                </span>

                                <span className="font-mono text-[10px] text-black">
                                  {String(
                                    document._id
                                  ).slice(-8)}
                                </span>

                              </div>


                              <h3 className="mt-2 break-all text-base font-medium text-black">
                                {filename}
                              </h3>


                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-black">

                                <span>
                                  {formatFileSize(
                                    document.fileSize ||
                                      document.size ||
                                      0
                                  )}
                                </span>

                                <span>
                                  Filed{" "}
                                  {formatDate(
                                    document.createdAt ||
                                      document.uploadedAt
                                  )}
                                </span>

                                <span>
                                  Downloads{" "}
                                  {document.downloadCount ||
                                    0}
                                </span>

                              </div>

                            </div>


                            <div className="flex flex-col items-start gap-3 xl:items-end">

                              <span
                                className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] ${status.classes}`}
                              >

                                <StatusIcon className="h-3.5 w-3.5 text-black" />

                                {status.label}

                              </span>


                              <ExpirationStatus
                                expiresAt={
                                  document.expiresAt
                                }
                              />

                            </div>

                          </div>


                          <div className="mt-5 flex flex-wrap gap-2 border-t border-black pt-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  document._id
                                )
                              }
                              className="inline-flex items-center gap-2 border border-black bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white"
                            >

                              <Eye className="h-3.5 w-3.5 text-black" />

                              Details

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  document
                                )
                              }
                              disabled={
                                downloadingId ===
                                  document._id ||
                                document.protectionStatus !==
                                  "protected"
                              }
                              className="inline-flex items-center gap-2 border border-black bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed"
                            >

                              <Download className="h-3.5 w-3.5 text-black" />

                              {downloadingId ===
                              document._id
                                ? "Downloading..."
                                : document.protectionStatus ===
                                    "protected"
                                  ? "Download"
                                  : "Protected action locked"}

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  document._id,
                                  "secure-link"
                                )
                              }
                              disabled={
                                document.protectionStatus !==
                                "protected"
                              }
                              className="inline-flex items-center gap-2 border border-black bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed"
                            >

                              <Link className="h-3.5 w-3.5 text-black" />

                              Create Secure Link

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  document._id
                                )
                              }
                              className="inline-flex items-center gap-2 border border-black bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white"
                            >

                              <Trash2 className="h-3.5 w-3.5 text-black" />

                              Delete Case File

                            </button>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>

          </Card>


          {/* DOCUMENT DETAILS */}

          {selectedDocument && (

            <Card
              ref={detailsSectionRef}
              className="scroll-mt-24 border-black bg-white text-black shadow-none"
            >

              <div className="flex items-start justify-between gap-5 border-b border-black pb-6">

                <div>

                  <div className="flex items-center gap-3">

                    <Eye className="h-5 w-5 text-black" />

                    <p className="text-[9px] uppercase tracking-[0.28em] text-black">
                      Case File
                    </p>

                  </div>


                  <h2 className="mt-2 text-2xl font-medium text-black">
                    Document Details
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={closeDetails}
                  className="border border-black bg-white p-2 text-black transition hover:bg-black hover:text-white"
                  aria-label="Close document details"
                >

                  <X className="h-4 w-4 text-black" />

                </button>

              </div>


              {isDetailsLoading ? (

                <div className="flex items-center gap-3 py-10 text-sm text-black">

                  <Activity className="h-5 w-5 animate-pulse text-black" />

                  Loading case details...

                </div>

              ) : detailsError ? (

                <div className="mt-6 border border-black bg-white p-5 text-sm text-black">
                  {detailsError}
                </div>

              ) : (

                <div className="pt-6">

                  <div className="grid gap-px border border-black bg-black sm:grid-cols-2">

                    {[
                      [
                        "Filename",
                        selectedDocument.originalFilename ||
                          selectedDocument.filename ||
                          "—",
                      ],
                      [
                        "File Size",
                        formatFileSize(
                          selectedDocument.fileSize ||
                            selectedDocument.size ||
                            0
                        ),
                      ],
                      [
                        "MIME Type",
                        selectedDocument.mimeType ||
                          selectedDocument.mimetype ||
                          "—",
                      ],
                      [
                        "Protection Status",
                        selectedDocument.protectionStatus ||
                          "—",
                      ],
                      [
                        "Password Protected",
                        selectedDocument.isPasswordProtected
                          ? "Yes"
                          : "No",
                      ],
                      [
                        "Download Count",
                        selectedDocument.downloadCount ||
                          0,
                      ],
                      [
                        "Uploaded",
                        formatDateTime(
                          selectedDocument.createdAt ||
                            selectedDocument.uploadedAt
                        ),
                      ],
                      [
                        "Last Updated",
                        formatDateTime(
                          selectedDocument.updatedAt
                        ),
                      ],
                      [
                        "Last Downloaded",
                        formatDateTime(
                          selectedDocument.lastDownloadedAt
                        ),
                      ],
                      [
                        "Expiration",
                        formatDateTime(
                          selectedDocument.expiresAt
                        ),
                      ],
                    ].map(
                      ([label, value]) => (

                        <div
                          key={label}
                          className="bg-white p-5"
                        >

                          <p className="text-[9px] uppercase tracking-[0.2em] text-black">
                            {label}
                          </p>

                          <p className="mt-2 break-words text-sm text-black">
                            {value}
                          </p>

                        </div>

                      )
                    )}

                  </div>


                  {/* SECURE LINK */}

                  <div
                    ref={secureLinkSectionRef}
                    className="mt-8 scroll-mt-24 border-t border-black pt-8"
                  >

                    <div className="flex items-center gap-3">

                      <Link className="h-5 w-5 text-black" />

                      <div>

                        <p className="text-[9px] uppercase tracking-[0.28em] text-black">
                          Controlled Distribution
                        </p>

                        <h3 className="mt-1 text-xl font-medium text-black">
                          Create Secure Link
                        </h3>

                      </div>

                    </div>


                    <form
                      onSubmit={
                        handleCreateSecureLink
                      }
                      className="mt-6 grid gap-4 lg:grid-cols-2"
                    >

                      <div>

                        <label
                          htmlFor="recipient-email"
                          className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-black"
                        >
                          Recipient email
                        </label>


                        <input
                          id="recipient-email"
                          type="email"
                          required
                          value={
                            recipientEmail
                          }
                          onChange={(event) =>
                            setRecipientEmail(
                              event.target.value
                            )
                          }
                          className="w-full border border-black bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black focus:border-black"
                          placeholder="recipient@example.com"
                        />

                      </div>


                      <div>

                        <label
                          htmlFor="secure-link-password"
                          className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-black"
                        >
                          Secure link password
                        </label>


                        <input
                          id="secure-link-password"
                          type="password"
                          required
                          value={
                            secureLinkPassword
                          }
                          onChange={(event) =>
                            setSecureLinkPassword(
                              event.target.value
                            )
                          }
                          className="w-full border border-black bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black focus:border-black"
                          placeholder="Create access password"
                        />

                      </div>


                      <div className="lg:col-span-2">

                        <button
                          type="submit"
                          disabled={
                            isCreatingSecureLink
                          }
                          className="inline-flex items-center gap-2 border border-black bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed"
                        >

                          <Link className="h-4 w-4 text-black" />

                          {isCreatingSecureLink
                            ? "Creating..."
                            : "Create Secure Link"}

                        </button>

                      </div>

                    </form>


                    {secureLinkError && (

                      <div className="mt-5 border border-black bg-white p-5 text-sm text-black">
                        {secureLinkError}
                      </div>

                    )}


                    {secureLinkSuccess && (

                      <div className="mt-6 border border-black bg-white p-5">

                        <div className="flex items-center gap-3">

                          <CheckCircle className="h-5 w-5 text-black" />

                          <p className="text-sm font-medium text-black">
                            Secure link created successfully.
                          </p>

                        </div>


                        <div className="mt-5">

                          <p className="text-[9px] uppercase tracking-[0.2em] text-black">
                            Generated URL
                          </p>


                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">

                            <input
                              type="text"
                              readOnly
                              value={
                                secureLinkSuccess.url ||
                                secureLinkSuccess.secureLink ||
                                secureLinkSuccess.link ||
                                ""
                              }
                              className="min-w-0 flex-1 border border-black bg-white px-4 py-3 text-xs text-black outline-none"
                            />


                            <button
                              type="button"
                              onClick={() =>
                                handleCopySecureLink(
                                  secureLinkSuccess.url ||
                                    secureLinkSuccess.secureLink ||
                                    secureLinkSuccess.link ||
                                    ""
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 border border-black bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-black hover:text-white"
                            >

                              <Copy className="h-4 w-4 text-black" />

                              Copy

                            </button>

                          </div>

                        </div>


                        {secureLinkSuccess.recipientEmail && (

                          <p className="mt-4 text-xs text-black">
                            Recipient:{" "}
                            {
                              secureLinkSuccess.recipientEmail
                            }
                          </p>

                        )}


                        {secureLinkSuccess.expiresAt && (

                          <p className="mt-2 text-xs text-black">
                            Expires:{" "}
                            {formatDateTime(
                              secureLinkSuccess.expiresAt
                            )}
                          </p>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              )}

            </Card>

          )}


          {/* ==================================================
              ACCESS HISTORY
              WHITE BACKGROUND = BLACK TEXT
              ================================================== */}

          <section className="border border-black bg-white text-black">

            <div className="border-b border-black px-6 py-6">

              <div className="flex items-center gap-3">

                <History className="h-5 w-5 text-black" />

                <div>

                  <p className="text-[9px] uppercase tracking-[0.28em] text-black">
                    Surveillance Log
                  </p>

                  <h2 className="mt-1 text-2xl font-medium text-black">
                    Access History
                  </h2>

                </div>

              </div>


              <p className="mt-3 text-sm text-black">
                Recent document access and activity recorded by the vault.
              </p>

            </div>


            <div className="px-6 py-6">

              {accessHistory.length === 0 ? (

                <div className="border border-dashed border-black bg-white px-6 py-12 text-center">

                  <History className="mx-auto h-8 w-8 text-black" />

                  <p className="mt-4 text-sm text-black">
                    No access activity recorded yet.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <div className="min-w-[720px]">

                    {/* TABLE HEADER */}

                    <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] border-b border-black px-4 pb-3 text-[9px] uppercase tracking-[0.2em] text-black">

                      <span>
                        Document
                      </span>

                      <span>
                        Action
                      </span>

                      <span>
                        Status
                      </span>

                      <span>
                        Date
                      </span>

                    </div>


                    {/* TABLE ROWS */}

                    <div className="divide-y divide-black">

                      {accessHistory.map(
                        (entry, index) => {

                          const documentName =
                            entry.document?.originalFilename ||
                            entry.documentName ||
                            entry.originalFilename ||
                            "Document";


                          return (

                            <div
                              key={
                                entry._id ||
                                entry.id ||
                                index
                              }
                              className="grid grid-cols-[2fr_1fr_1fr_1.5fr] items-center bg-white px-4 py-4 text-xs text-black"
                            >

                              <span className="truncate pr-5 text-black">
                                {documentName}
                              </span>


                              <span className="text-black">
                                {entry.action ||
                                  "Access"}
                              </span>


                              <span className="text-black">
                                {entry.status ||
                                  "Recorded"}
                              </span>


                              <span className="text-black">
                                {formatDateTime(
                                  entry.createdAt ||
                                    entry.timestamp
                                )}
                              </span>

                            </div>

                          );

                        }
                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          </section>


          {/* FOOTER */}

          <footer className="border-t border-black pt-6">

            <div className="flex flex-col gap-3 text-[9px] uppercase tracking-[0.2em] text-black sm:flex-row sm:items-center sm:justify-between">

              <span>
                SecurePDF Vault
              </span>

              <span>
                Private document security
              </span>

            </div>

          </footer>

        </div>

      </DashboardLayout>

    </main>
  );
}


// ============================================================
// APP
// ============================================================

function App() {
  return (
    <div className="min-h-screen bg-white text-black">

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/secure/:token"
          element={<SecureLinkAccess />}
        />


        <Route
          path="/payment/crypto"
          element={<CryptoPayment />}
        />


        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

        </Route>


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