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
    <main className="min-h-screen bg-black">

      {/* ==================================================
          CORE VISUAL
          STANDALONE PHOTOGRAPH — NO TEXT / NO OVERLAY
          ================================================== */}

      <section className="w-full bg-black">

        <div className="w-full overflow-hidden">

          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[60vh] min-h-[420px] w-full object-cover object-center sm:h-[70vh] lg:h-[78vh]"
          />

        </div>

      </section>


      {/* ==================================================
          HOMEPAGE CONTENT
          COMPLETELY SEPARATE FROM THE PHOTOGRAPH
          ================================================== */}

      <section className="w-full border-t border-white/20 bg-black">

        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:py-24">

          <div className="max-w-3xl">

            <p className="text-[10px] uppercase tracking-[0.3em] text-white">
              SecurePDF Vault
            </p>

            <h1 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
              Protect what must remain private.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white">
              SecurePDF Vault protects sensitive PDF documents with controlled
              access, password protection, and private document distribution.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <a
                href="/register"
                className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
              >
                Open Vault
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/login"
                className="inline-flex items-center gap-2 border border-white bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
              >
                Login
              </a>

            </div>

          </div>


          <div className="mt-16 grid gap-px border border-white/20 bg-white/20 sm:grid-cols-3">

            <div className="bg-black p-6">

              <ShieldCheck className="h-5 w-5 text-white" />

              <p className="mt-5 text-sm font-medium text-white">
                Private document security
              </p>

              <p className="mt-2 text-xs leading-6 text-white">
                Keep sensitive PDF documents protected and controlled.
              </p>

            </div>


            <div className="bg-black p-6">

              <LockKeyhole className="h-5 w-5 text-white" />

              <p className="mt-5 text-sm font-medium text-white">
                Password protection
              </p>

              <p className="mt-2 text-xs leading-6 text-white">
                Protect documents before they are distributed.
              </p>

            </div>


            <div className="bg-black p-6">

              <Link className="h-5 w-5 text-white" />

              <p className="mt-5 text-sm font-medium text-white">
                Controlled sharing
              </p>

              <p className="mt-2 text-xs leading-6 text-white">
                Share protected documents through secure access links.
              </p>

            </div>

          </div>

        </div>

      </section>


      <footer className="border-t border-white/20 bg-black">

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-7 text-[9px] uppercase tracking-[0.2em] text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">

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
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);


  useEffect(() => {
    let mounted = true;

    async function loadSecureLink() {
      try {
        setIsLoading(true);
        setError("");

        const response = await accessSecureLink(token);

        if (!mounted) {
          return;
        }

        setDocument(
          response?.document || response
        );

        setRequiresPassword(
          Boolean(response?.requiresPassword)
        );

      } catch (err) {

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            "This secure link is invalid, expired, or unavailable."
        );

      } finally {

        if (mounted) {
          setIsLoading(false);
        }

      }
    }


    if (token) {
      loadSecureLink();
    }


    return () => {
      mounted = false;
    };

  }, [token]);


  async function handleDownload() {
    try {

      setIsDownloading(true);
      setError("");

      await downloadSecureLinkDocument(
        token,
        password
      );

    } catch (err) {

      setError(
        err?.response?.data?.message ||
          "Unable to download this document."
      );

    } finally {

      setIsDownloading(false);

    }
  }


  return (
    <main className="min-h-screen bg-black">

      {/* STANDALONE PHOTOGRAPH */}

      <section className="w-full bg-black">

        <div className="w-full overflow-hidden">

          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[55vh] min-h-[420px] w-full object-cover object-center sm:h-[65vh] lg:h-[72vh]"
          />

        </div>

      </section>


      {/* CONTENT */}

      <section className="w-full border-t border-white/20 bg-black">

        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">

          <Card className="w-full border-white/20 bg-[#0a0a0a] text-white shadow-none">

            <div className="border-b border-white/20 pb-6">

              <div className="flex items-center gap-3">

                <LockKeyhole className="h-5 w-5 text-white" />

                <div>

                  <p className="text-[10px] uppercase tracking-[0.28em] text-white">
                    Secure Access
                  </p>

                  <h1 className="mt-1 text-2xl font-medium text-white">
                    Private Document
                  </h1>

                </div>

              </div>


              <p className="mt-4 max-w-xl text-sm leading-6 text-white">
                This document has been shared through a controlled
                SecurePDF Vault access link.
              </p>

            </div>


            {isLoading ? (

              <div className="flex items-center gap-3 py-12 text-sm text-white">

                <Activity className="h-4 w-4 animate-pulse text-white" />

                Checking secure link...

              </div>

            ) : error ? (

              <div className="mt-6 border border-red-500/60 bg-red-950/30 p-5">

                <div className="flex items-start gap-3">

                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

                  <div>

                    <p className="text-sm font-medium text-white">
                      Secure access unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white">
                      {error}
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="space-y-7 pt-7">

                <div className="border border-white/20 bg-black p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/20 bg-[#0a0a0a]">

                      <FileText className="h-5 w-5 text-white" />

                    </div>


                    <div className="min-w-0">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-white">
                        Document
                      </p>

                      <p className="mt-2 break-all text-lg leading-7 text-white">
                        {document?.originalFilename ||
                          document?.filename ||
                          "Protected PDF"}
                      </p>

                    </div>

                  </div>


                  {document?.expiresAt && (

                    <div className="mt-5 border-t border-white/20 pt-5">

                      <ExpirationStatus
                        expiresAt={
                          document.expiresAt
                        }
                      />

                    </div>

                  )}

                </div>


                {requiresPassword && (

                  <div>

                    <label
                      htmlFor="secure-link-password"
                      className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-white"
                    >
                      Document password
                    </label>


                    <input
                      id="secure-link-password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      className="w-full border border-white/30 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/60 transition focus:border-white"
                      placeholder="Enter document password"
                    />

                  </div>

                )}


                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex w-full items-center justify-center gap-2 border border-white bg-white px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isDownloading ? (
                    <Activity className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}

                  {isDownloading
                    ? "Preparing document..."
                    : "Download protected PDF"}

                </button>


                <div className="border-t border-white/20 pt-6">

                  <div className="flex items-start gap-3">

                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white" />

                    <p className="text-xs leading-6 text-white">
                      Access is controlled by the private secure link.
                      Only authorized recipients should download this
                      document.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </Card>

        </div>

      </section>


      <footer className="border-t border-white/20 bg-black">

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-7 text-[9px] uppercase tracking-[0.2em] text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">

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
          "border-emerald-500/60 bg-emerald-950/40 text-white",
      };

    }


    if (status === "processing") {

      return {
        label: "Processing",
        icon: Clock3,
        classes:
          "border-white/30 bg-white/10 text-white",
      };

    }


    if (status === "failed") {

      return {
        label: "Failed",
        icon: CircleAlert,
        classes:
          "border-red-500/60 bg-red-950/40 text-white",
      };

    }


    if (status === "pending") {

      return {
        label: "Pending",
        icon: Circle,
        classes:
          "border-white/30 bg-white/10 text-white",
      };

    }


    return {
      label: "Unknown",
      icon: Circle,
      classes:
        "border-white/30 bg-white/10 text-white",
    };

  }


  return (
    <main className="min-h-screen bg-black">

      {/* STANDALONE PHOTOGRAPH */}

      <section className="w-full bg-black">

        <div className="w-full overflow-hidden">

          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[55vh] min-h-[420px] w-full object-cover object-center sm:h-[65vh] lg:h-[72vh]"
          />

        </div>

      </section>


      <DashboardLayout>

        <div className="space-y-7 pb-12 pt-12">

          {/* INTRO */}

          <section className="border-y border-white/20 py-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <ShieldCheck className="h-5 w-5 text-white" />

                  <p className="text-[10px] uppercase tracking-[0.3em] text-white">
                    Private Document Registry
                  </p>

                </div>


                <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">
                  Your Vault
                </h1>


                <p className="mt-3 max-w-2xl text-sm leading-7 text-white">
                  Manage protected PDF documents, controlled downloads,
                  secure links, and access activity from one private archive.
                </p>

              </div>


              <div className="border border-white/20 bg-[#0a0a0a] px-5 py-4">

                <p className="text-[9px] uppercase tracking-[0.25em] text-white">
                  Vault status
                </p>


                <div className="mt-2 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-sm text-white">
                    Operational
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* STATISTICS */}

          <section className="grid gap-px border border-white/20 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">

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
                  className="bg-[#0a0a0a] px-5 py-6"
                >

                  <p className="text-[9px] uppercase tracking-[0.24em] text-white">
                    {label}
                  </p>

                  <p className="mt-3 text-3xl font-medium text-white">
                    {value}
                  </p>

                  <p className="mt-2 text-xs text-white">
                    {description}
                  </p>

                </div>

              )
            )}

          </section>


          {/* PDF INTAKE */}

          <Card className="border-white/20 bg-[#0a0a0a] text-white shadow-none">

            <div className="flex flex-col gap-5 border-b border-white/20 pb-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <FileLock2 className="h-5 w-5 text-white" />

                  <p className="text-[9px] uppercase tracking-[0.28em] text-white">
                    Case Intake
                  </p>

                </div>


                <h2 className="mt-2 text-2xl font-medium text-white">
                  Protect a PDF
                </h2>


                <p className="mt-2 max-w-2xl text-sm leading-6 text-white">
                  Upload a PDF document to begin the protection process.
                </p>

              </div>

            </div>


            <div className="pt-6">
              <PdfUpload />
            </div>

          </Card>


          {/* DOCUMENT REGISTRY */}

          <Card className="border-white/20 bg-[#0a0a0a] text-white shadow-none">

            <div className="flex flex-col gap-5 border-b border-white/20 pb-6 xl:flex-row xl:items-end xl:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <FileText className="h-5 w-5 text-white" />

                  <p className="text-[9px] uppercase tracking-[0.28em] text-white">
                    Case Files
                  </p>

                </div>


                <h2 className="mt-2 text-2xl font-medium text-white">
                  Your Documents
                </h2>


                <p className="mt-2 text-sm text-white">
                  Search, inspect, download, distribute, or remove your files.
                </p>

              </div>


              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />


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
                    className="w-full border border-white/30 bg-black py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/60 focus:border-white sm:w-64"
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
                  className="border border-white/30 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
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

                <div className="flex items-center justify-center gap-3 py-14 text-sm text-white">

                  <Activity className="h-5 w-5 animate-pulse text-white" />

                  Loading your documents...

                </div>

              ) : error ? (

                <div className="border border-red-500/60 bg-red-950/30 p-5 text-sm text-white">
                  {error}
                </div>

              ) : documents.length === 0 ? (

                <div className="border border-dashed border-white/30 bg-black px-6 py-14 text-center">

                  <FileText className="mx-auto h-8 w-8 text-white" />

                  <p className="mt-4 text-sm text-white">
                    No documents have been added yet.
                  </p>

                  <p className="mt-2 text-xs text-white">
                    Upload a PDF above to create your first case file.
                  </p>

                </div>

              ) : filteredDocuments.length === 0 ? (

                <div className="border border-dashed border-white/30 bg-black px-6 py-14 text-center">

                  <Search className="mx-auto h-8 w-8 text-white" />

                  <p className="mt-4 text-sm text-white">
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
                          className="border border-white/20 bg-black p-5 transition hover:border-white/50"
                        >

                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-3">

                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white">
                                  CASE
                                </span>

                                <span className="font-mono text-[10px] text-white">
                                  {String(
                                    document._id
                                  ).slice(-8)}
                                </span>

                              </div>


                              <h3 className="mt-2 break-all text-base font-medium text-white">
                                {filename}
                              </h3>


                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white">

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

                                <StatusIcon className="h-3.5 w-3.5" />

                                {status.label}

                              </span>


                              <ExpirationStatus
                                expiresAt={
                                  document.expiresAt
                                }
                              />

                            </div>

                          </div>


                          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/20 pt-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  document._id
                                )
                              }
                              className="inline-flex items-center gap-2 border border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black"
                            >

                              <Eye className="h-3.5 w-3.5" />

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
                              className="inline-flex items-center gap-2 border border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >

                              <Download className="h-3.5 w-3.5" />

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
                              className="inline-flex items-center gap-2 border border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >

                              <Link className="h-3.5 w-3.5" />

                              Create Secure Link

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  document._id
                                )
                              }
                              className="inline-flex items-center gap-2 border border-red-500/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-red-400 hover:bg-red-950/30"
                            >

                              <Trash2 className="h-3.5 w-3.5" />

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
              className="scroll-mt-24 border-white/20 bg-[#0a0a0a] text-white shadow-none"
            >

              <div className="flex items-start justify-between gap-5 border-b border-white/20 pb-6">

                <div>

                  <div className="flex items-center gap-3">

                    <Eye className="h-5 w-5 text-white" />

                    <p className="text-[9px] uppercase tracking-[0.28em] text-white">
                      Case File
                    </p>

                  </div>


                  <h2 className="mt-2 text-2xl font-medium text-white">
                    Document Details
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={closeDetails}
                  className="border border-white/30 p-2 text-white transition hover:border-white hover:bg-white hover:text-black"
                  aria-label="Close document details"
                >

                  <X className="h-4 w-4" />

                </button>

              </div>


              {isDetailsLoading ? (

                <div className="flex items-center gap-3 py-10 text-sm text-white">

                  <Activity className="h-5 w-5 animate-pulse text-white" />

                  Loading case details...

                </div>

              ) : detailsError ? (

                <div className="mt-6 border border-red-500/60 bg-red-950/30 p-5 text-sm text-white">
                  {detailsError}
                </div>

              ) : (

                <div className="pt-6">

                  <div className="grid gap-px border border-white/20 bg-white/10 sm:grid-cols-2">

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
                          className="bg-black p-5"
                        >

                          <p className="text-[9px] uppercase tracking-[0.2em] text-white">
                            {label}
                          </p>

                          <p className="mt-2 break-words text-sm text-white">
                            {value}
                          </p>

                        </div>

                      )
                    )}

                  </div>


                  {/* SECURE LINK */}

                  <div
                    ref={secureLinkSectionRef}
                    className="mt-8 scroll-mt-24 border-t border-white/20 pt-8"
                  >

                    <div className="flex items-center gap-3">

                      <Link className="h-5 w-5 text-white" />

                      <div>

                        <p className="text-[9px] uppercase tracking-[0.28em] text-white">
                          Controlled Distribution
                        </p>

                        <h3 className="mt-1 text-xl font-medium text-white">
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
                          className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-white"
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
                          className="w-full border border-white/30 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/60 focus:border-white"
                          placeholder="recipient@example.com"
                        />

                      </div>


                      <div>

                        <label
                          htmlFor="secure-link-password"
                          className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-white"
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
                          className="w-full border border-white/30 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/60 focus:border-white"
                          placeholder="Create access password"
                        />

                      </div>


                      <div className="lg:col-span-2">

                        <button
                          type="submit"
                          disabled={
                            isCreatingSecureLink
                          }
                          className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Link className="h-4 w-4" />

                          {isCreatingSecureLink
                            ? "Creating..."
                            : "Create Secure Link"}

                        </button>

                      </div>

                    </form>


                    {secureLinkError && (

                      <div className="mt-5 border border-red-500/60 bg-red-950/30 p-5 text-sm text-white">
                        {secureLinkError}
                      </div>

                    )}


                    {secureLinkSuccess && (

                      <div className="mt-6 border border-emerald-500/60 bg-emerald-950/35 p-5">

                        <div className="flex items-center gap-3">

                          <CheckCircle className="h-5 w-5 text-emerald-300" />

                          <p className="text-sm font-medium text-white">
                            Secure link created successfully.
                          </p>

                        </div>


                        <div className="mt-5">

                          <p className="text-[9px] uppercase tracking-[0.2em] text-white">
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
                              className="min-w-0 flex-1 border border-white/30 bg-black px-4 py-3 text-xs text-white outline-none"
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
                              className="inline-flex items-center justify-center gap-2 border border-white/30 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-black"
                            >

                              <Copy className="h-4 w-4" />

                              Copy

                            </button>

                          </div>

                        </div>


                        {secureLinkSuccess.recipientEmail && (

                          <p className="mt-4 text-xs text-white">
                            Recipient:{" "}
                            {
                              secureLinkSuccess.recipientEmail
                            }
                          </p>

                        )}


                        {secureLinkSuccess.expiresAt && (

                          <p className="mt-2 text-xs text-white">
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

            <div className="border-b border-black/15 px-6 py-6">

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

                <div className="border border-dashed border-black/30 bg-white px-6 py-12 text-center">

                  <History className="mx-auto h-8 w-8 text-black" />

                  <p className="mt-4 text-sm text-black">
                    No access activity recorded yet.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <div className="min-w-[720px]">

                    {/* TABLE HEADER */}

                    <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] border-b border-black/20 px-4 pb-3 text-[9px] uppercase tracking-[0.2em] text-black">

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

                    <div className="divide-y divide-black/10">

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


                              <span
                                className={
                                  entry.status ===
                                  "success"
                                    ? "text-green-700"
                                    : entry.status ===
                                        "failed"
                                      ? "text-red-700"
                                      : "text-black"
                                }
                              >
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

          <footer className="border-t border-white/20 pt-6">

            <div className="flex flex-col gap-3 text-[9px] uppercase tracking-[0.2em] text-white sm:flex-row sm:items-center sm:justify-between">

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
    <div className="min-h-screen bg-black text-white">

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