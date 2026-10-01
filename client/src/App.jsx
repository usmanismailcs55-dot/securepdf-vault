import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  Fingerprint,
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


/* =========================================================
   HOME
========================================================= */

function Home() {
  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-[#050403]">

      {/* =====================================================
          HERO PHOTOGRAPH
      ===================================================== */}

      <div className="absolute inset-0">

        <img
          src="/images/noir-vault-hero.jpg"
          alt="Detective noir desk with SecurePDF Vault case file"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Deep cinematic grade */}

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58)_0%,transparent_18%,transparent_74%,rgba(0,0,0,0.78)_100%)]" />

        {/* Subtle left-side darkness for minimal branding */}

        <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-black/65 via-black/20 to-transparent" />

      </div>


      {/* =====================================================
          MINIMAL BRAND MARK
      ===================================================== */}

      <div className="absolute left-5 top-7 z-10 sm:left-8 sm:top-9 lg:left-12 lg:top-11">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center border border-[#d0aa70]/70 bg-black/45 text-[#d0aa70] backdrop-blur-sm">

            <ShieldCheck
              size={18}
              strokeWidth={1.5}
              aria-hidden="true"
            />

          </div>

          <div>

            <p className="font-serif text-sm font-bold uppercase tracking-[0.16em] text-[#f0e7d8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              SecurePDF Vault
            </p>

            <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.32em] text-[#c7a36a]">
              Private document security
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          MINIMAL CASE MARKER
      ===================================================== */}

      <div className="absolute right-5 top-7 z-10 sm:right-8 sm:top-9 lg:right-12 lg:top-11">

        <div className="border border-white/20 bg-black/35 px-3 py-2 backdrop-blur-sm">

          <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-[#d3c4ae]">
            CASE / 212
          </p>

        </div>

      </div>


      {/* =====================================================
          MINIMAL HERO ACTIONS
      ===================================================== */}

      <div className="absolute bottom-10 left-5 z-10 sm:left-8 sm:bottom-12 lg:left-12 lg:bottom-14">

        <div className="flex flex-wrap items-center gap-3">

          <a
            href="/register"
            className="group inline-flex items-center gap-3 border border-[#d0aa70] bg-[#8f6b43]/95 px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#fff8eb] shadow-[0_12px_35px_rgba(0,0,0,0.55)] transition duration-300 hover:border-[#f0ca8a] hover:bg-[#a47b49]"
          >

            <LockKeyhole
              size={15}
              strokeWidth={1.7}
              aria-hidden="true"
            />

            Open Vault

            <ArrowRight
              size={14}
              strokeWidth={1.7}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />

          </a>


          <a
            href="/login"
            className="inline-flex items-center gap-2 border border-white/30 bg-black/40 px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#eee5d7] backdrop-blur-sm transition duration-300 hover:border-[#d0aa70] hover:bg-black/60 hover:text-[#f0ca8a]"
          >
            Login
          </a>

        </div>

      </div>


      {/* =====================================================
          SMALL FOOTER MARK
      ===================================================== */}

      <div className="absolute bottom-10 right-5 z-10 hidden sm:block lg:right-12 lg:bottom-14">

        <p className="font-mono text-[7px] uppercase tracking-[0.25em] text-white/45">
          Confidential / Authorized Users Only
        </p>

      </div>


      {/* =====================================================
          IMAGE EDGE FRAME
      ===================================================== */}

      <div className="pointer-events-none absolute inset-4 border border-white/10 sm:inset-6 lg:inset-8" />

    </main>
  );
}


/* =========================================================
   SECURE LINK ACCESS
========================================================= */

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
    <main className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden bg-[#090806] px-5 py-10">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(176,138,87,0.12),transparent_38%)]" />

      <div className="relative w-full max-w-md">

        <div className="mb-4 flex items-center justify-between border-b border-[#3e2f21] pb-3">

          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#92734a]">
            Confidential access
          </p>

          <p className="font-mono text-[8px] text-[#5e4d3b]">
            CASE / SECURE
          </p>

        </div>


        <Card className="border-[#4b3823] bg-[#15100c] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:p-9">

          {!document ? (

            <>

              <div className="border-b border-[#3b2d20] pb-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#765a37] bg-[#1a130c] text-[#c7a36a]">

                    <Link
                      size={22}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />

                  </div>

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8e6b43]">
                      Private document
                    </p>

                    <h1 className="mt-1 font-serif text-2xl font-bold uppercase tracking-wide text-[#e8dfcf]">
                      Secure PDF Link
                    </h1>

                  </div>

                </div>

              </div>


              <p className="mt-6 text-sm leading-6 text-[#9d8f7d]">
                Enter the access password supplied by the
                document owner.
              </p>


              <form
                onSubmit={handleAccess}
                className="mt-7 space-y-5"
              >

                <div>

                  <label
                    htmlFor="secure-link-password"
                    className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8d795f]"
                  >
                    Access password
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
                    className="mt-2 block w-full rounded-sm border border-[#59432b] bg-[#0d0a08] px-3 py-3 text-sm text-[#e8dfcf] outline-none transition placeholder:text-[#655747] focus:border-[#aa804f] focus:ring-1 focus:ring-[#8b693f] disabled:opacity-50"
                  />

                </div>


                {error && (

                  <div
                    role="alert"
                    className="border border-[#713c32] bg-[#281410] px-3 py-3 text-sm text-[#dca89b]"
                  >
                    {error}
                  </div>

                )}


                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 border border-[#a17a49] bg-[#8f6b43] px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#fff4df] transition hover:bg-[#a17c4c] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <LockKeyhole
                    size={15}
                    aria-hidden="true"
                  />

                  {loading
                    ? "Checking..."
                    : "Verify Access"}

                </button>

              </form>


              <div className="mt-6 border-t border-[#382a1c] pt-4">

                <p className="break-all font-mono text-[8px] leading-5 text-[#5f5040]">
                  TOKEN / {token}
                </p>

              </div>

            </>

          ) : (

            <div>

              <div className="flex items-center gap-4 border-b border-[#3b2d20] pb-6">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#56623a] bg-[#151c0e] text-[#aabd7a]">

                  <CheckCircle
                    size={22}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />

                </div>

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8fa05d]">
                    Verification complete
                  </p>

                  <h1 className="mt-1 font-serif text-2xl font-bold uppercase tracking-wide text-[#e8dfcf]">
                    Access Granted
                  </h1>

                </div>

              </div>


              <div className="mt-6 border border-[#493521] bg-[#0d0a08] p-5">

                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#76634f]">
                  Protected document
                </p>

                <p className="mt-2 break-words font-serif text-lg font-semibold text-[#ded1bf]">
                  {document.originalFilename}
                </p>

              </div>


              <p className="mt-5 text-sm leading-6 text-[#988a77]">
                The secure-link password has been verified
                successfully.
              </p>


              {error && (

                <div
                  role="alert"
                  className="mt-4 border border-[#713c32] bg-[#281410] px-3 py-3 text-sm text-[#dca89b]"
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
                className="mt-6 inline-flex w-full items-center justify-center gap-2 border border-[#a17a49] bg-[#8f6b43] px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#fff4df] transition hover:bg-[#a17c4c] disabled:cursor-not-allowed disabled:bg-[#403426]"
              >

                <Download
                  size={16}
                  aria-hidden="true"
                />

                {downloading
                  ? "Downloading..."
                  : "Download Protected PDF"}

              </button>

            </div>

          )}

        </Card>

      </div>

    </main>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

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

  const detailsSectionRef = useRef(null);
  const secureLinkSectionRef = useRef(null);

  const [scrollTarget, setScrollTarget] =
    useState(null);


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


  useEffect(() => {
    if (!selectedDocument || !scrollTarget) {
      return;
    }

    const targetRef =
      scrollTarget === "secure-link"
        ? secureLinkSectionRef
        : detailsSectionRef;

    requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setScrollTarget(null);
    });
  }, [selectedDocument, scrollTarget]);


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


  const handleViewDetails = async (
    documentId,
    target = "details"
  ) => {
    try {
      setIsDetailsLoading(true);
      setDetailsError("");

      setSecureLinkError("");
      setSecureLinkSuccess(null);

      setRecipientEmail("");
      setSecureLinkPassword("");

      setScrollTarget(target);
      setSelectedDocument(null);

      const document =
        await getDocumentDetails(documentId);

      setSelectedDocument(document);
    } catch (error) {
      setDetailsError(
        error.message || "Failed to load document details."
      );
      setScrollTarget(null);
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
    setScrollTarget(null);
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
            "border border-[#56623a] bg-[#18200f] text-[#aabd7a]",
        };

      case "processing":
        return {
          label: "Processing",
          icon: Clock3,
          className:
            "border border-[#69552e] bg-[#211a0d] text-[#d0aa70]",
        };

      case "failed":
        return {
          label: "Failed",
          icon: CircleAlert,
          className:
            "border border-[#713c32] bg-[#281410] text-[#dca89b]",
        };

      case "pending":
        return {
          label: "Pending",
          icon: Circle,
          className:
            "border border-[#4b4032] bg-[#1a1611] text-[#a99c89]",
        };

      default:
        return {
          label: "Unknown",
          icon: Circle,
          className:
            "border border-[#4b4032] bg-[#1a1611] text-[#a99c89]",
        };
    }
  };


  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <section className="relative overflow-hidden border border-[#493521] bg-[#120e0a] shadow-[0_25px_65px_rgba(0,0,0,0.5)]">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(176,138,87,0.12),transparent_45%)]" />

          <div className="absolute right-0 top-0 h-full w-px bg-[#765a37]/30" />

          <div className="relative flex flex-col justify-between gap-8 p-7 sm:p-9 lg:flex-row lg:items-end lg:p-11">

            <div>

              <div className="mb-4 flex items-center gap-3">

                <Fingerprint
                  size={17}
                  strokeWidth={1.5}
                  className="text-[#b08a57]"
                />

                <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#92734a]">
                  Private document registry
                </p>

              </div>

              <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.02em] text-[#e8dfcf] sm:text-5xl">
                Dashboard
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#988b79]">
                Your private workspace for protected documents,
                controlled distribution, downloads, and security
                activity.
              </p>

            </div>


            <div className="shrink-0 border-l border-[#55402a] pl-5">

              <p className="text-[8px] uppercase tracking-[0.28em] text-[#6d5a46]">
                Vault status
              </p>

              <div className="mt-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#8fa05d] shadow-[0_0_12px_rgba(143,160,93,0.6)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b5bd91]">
                  Operational
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-px overflow-hidden border border-[#493521] bg-[#493521] sm:grid-cols-2 lg:grid-cols-4">

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
          ].map(([label, value, description]) => (

            <div
              key={label}
              className="relative bg-[#15100c] p-6 transition hover:bg-[#1a140e]"
            >

              <div className="absolute right-0 top-0 h-8 w-8 border-b border-l border-[#765a37]/30" />

              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#77634c]">
                {label}
              </p>

              <p className="mt-3 font-serif text-4xl font-bold text-[#e6dccd]">
                {value}
              </p>

              <p className="mt-3 text-[9px] uppercase tracking-[0.15em] text-[#635343]">
                {description}
              </p>

            </div>

          ))}

        </div>


        {/* =================================================
            PDF INTAKE
        ================================================= */}

        <Card className="border-[#493521] bg-[#15100c] p-0 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">

          <div className="border-b border-[#3d2e20] px-6 py-6 sm:px-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#765a37] bg-[#1a130c] text-[#c7a36a]">

                <FileLock2
                  size={19}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

              </div>

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#92734a]">
                  Case intake
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#e6dccd]">
                  Protect a PDF
                </h2>

                <p className="mt-1 text-sm text-[#8f8170]">
                  Place a document inside the vault and
                  protect it with a password.
                </p>

              </div>

            </div>

          </div>


          <div className="p-6 sm:p-8">

            <PdfUpload />

          </div>

        </Card>


        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <Card className="border-[#493521] bg-[#15100c] p-0 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">

          <div className="border-b border-[#3d2e20] px-6 py-6 sm:px-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#92734a]">
                  Case files
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#e6dccd]">
                  Your Documents
                </h2>

                <p className="mt-1 text-sm text-[#8f8170]">
                  Review and manage documents stored in your vault.
                </p>

              </div>


              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

                <div className="w-full sm:w-64">

                  <label
                    htmlFor="document-search"
                    className="mb-2 block text-[8px] font-bold uppercase tracking-[0.22em] text-[#76634c]"
                  >
                    Search
                  </label>

                  <div className="relative">

                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#705c46]"
                      aria-hidden="true"
                    />

                    <input
                      id="document-search"
                      type="text"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value
                        )
                      }
                      placeholder="Search filename..."
                      className="w-full rounded-sm border border-[#59432b] bg-[#0d0a08] py-2.5 pl-9 pr-3 text-sm text-[#e8dfcf] outline-none transition placeholder:text-[#625342] focus:border-[#a17a49] focus:ring-1 focus:ring-[#8b693f]"
                    />

                  </div>

                </div>


                <div className="w-full sm:w-48">

                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-[8px] font-bold uppercase tracking-[0.22em] text-[#76634c]"
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
                    className="w-full rounded-sm border border-[#59432b] bg-[#0d0a08] px-3 py-2.5 text-sm text-[#e8dfcf] outline-none transition focus:border-[#a17a49] focus:ring-1 focus:ring-[#8b693f]"
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

          </div>


          <div className="p-6 sm:p-8">

            {isLoading && (

              <div className="border border-[#403225] bg-[#0d0a08] p-10 text-center">

                <Activity
                  size={22}
                  className="mx-auto animate-pulse text-[#92734a]"
                  aria-hidden="true"
                />

                <p className="mt-4 text-sm text-[#8f806e]">
                  Loading case files...
                </p>

              </div>

            )}


            {!isLoading && error && (

              <div className="border border-[#713c32] bg-[#281410] p-4">

                <p className="text-sm font-medium text-[#dca89b]">
                  {error}
                </p>

              </div>

            )}


            {!isLoading &&
              !error &&
              documents.length === 0 && (

                <div className="border border-dashed border-[#59432b] bg-[#0d0a08] px-6 py-14 text-center">

                  <FileText
                    size={30}
                    strokeWidth={1.3}
                    className="mx-auto text-[#765a37]"
                    aria-hidden="true"
                  />

                  <p className="mt-5 font-serif text-lg font-semibold text-[#d8cbb9]">
                    No case files
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm text-[#776957]">
                    Upload your first PDF and it will appear
                    here as a protected case file.
                  </p>

                </div>

              )}


            {!isLoading &&
              !error &&
              documents.length > 0 &&
              filteredDocuments.length === 0 && (

                <div className="border border-dashed border-[#59432b] bg-[#0d0a08] px-6 py-14 text-center">

                  <Search
                    size={28}
                    strokeWidth={1.3}
                    className="mx-auto text-[#765a37]"
                    aria-hidden="true"
                  />

                  <p className="mt-5 font-serif text-lg font-semibold text-[#d8cbb9]">
                    No matching case files
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm text-[#817260]">
                    Change your search or status filter and
                    try again.
                  </p>

                </div>

              )}


            {!isLoading &&
              !error &&
              filteredDocuments.length > 0 && (

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {filteredDocuments.map(
                    (document) => {

                      const status =
                        getProtectionStatus(
                          document.protectionStatus
                        );

                      const StatusIcon =
                        status.icon;

                      return (

                        <article
                          key={document._id}
                          className="group relative overflow-hidden border border-[#493521] bg-[#100c09] shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 hover:border-[#765a37] hover:shadow-[0_22px_50px_rgba(0,0,0,0.5)]"
                        >

                          <div className="flex items-center justify-between border-b border-[#3b2d20] bg-[#17110c] px-4 py-3">

                            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#665442]">
                              CASE / {document._id.slice(-6)}
                            </span>

                            <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#806b53]">
                              SPV
                            </span>

                          </div>


                          <div className="p-5">

                            <div className="flex items-start gap-4">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#765a37] bg-[#1a130c] text-[#c7a36a]">

                                <FileText
                                  size={21}
                                  strokeWidth={1.4}
                                  aria-hidden="true"
                                />

                              </div>

                              <div className="min-w-0">

                                <p className="truncate font-serif text-lg font-semibold text-[#e0d4c4]">
                                  {document.originalFilename}
                                </p>

                                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#6d5a46]">
                                  {formatFileSize(
                                    document.fileSize
                                  )}
                                </p>

                              </div>

                            </div>


                            <div className="mt-5 flex items-center justify-between border-y border-[#33271c] py-3">

                              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#6e5b46]">
                                Protection
                              </span>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${status.className}`}
                              >

                                <StatusIcon
                                  size={12}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />

                                {status.label}

                              </span>

                            </div>


                            <div className="grid grid-cols-2 gap-px overflow-hidden border border-[#33271c] bg-[#33271c]">

                              <div className="bg-[#0d0a08] p-3">

                                <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#675645]">
                                  Filed
                                </p>

                                <p className="mt-1 text-xs text-[#b0a18e]">
                                  {formatDate(
                                    document.createdAt
                                  )}
                                </p>

                              </div>


                              <div className="bg-[#0d0a08] p-3">

                                <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#675645]">
                                  Downloads
                                </p>

                                <p className="mt-1 text-xs text-[#b0a18e]">
                                  {
                                    document.downloadCount ||
                                    0
                                  }
                                </p>

                              </div>


                              <div className="bg-[#0d0a08] p-3">

                                <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#675645]">
                                  Expiration
                                </p>

                                <div className="mt-1">
                                  <ExpirationStatus
                                    expiresAt={
                                      document.expiresAt
                                    }
                                  />
                                </div>

                              </div>


                              <div className="bg-[#0d0a08] p-3">

                                <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-[#675645]">
                                  State
                                </p>

                                <p className="mt-1 text-xs uppercase text-[#b0a18e]">
                                  {document.protectionStatus}
                                </p>

                              </div>

                            </div>


                            <div className="mt-5 grid grid-cols-2 gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewDetails(
                                    document._id,
                                    "details"
                                  )
                                }
                                disabled={
                                  isDetailsLoading
                                }
                                className="inline-flex items-center justify-center gap-1.5 border border-[#59432b] bg-[#17110c] px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#bcae9a] transition hover:border-[#987447] hover:text-[#dfbc7d] disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                <Eye
                                  size={13}
                                  aria-hidden="true"
                                />

                                Details

                              </button>


                              {document.protectionStatus ===
                                "protected" ? (

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
                                  className="inline-flex items-center justify-center gap-1.5 border border-[#a17a49] bg-[#8f6b43] px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#fff4df] transition hover:bg-[#a17c4c] disabled:cursor-not-allowed disabled:bg-[#403426]"
                                >

                                  <Download
                                    size={13}
                                    aria-hidden="true"
                                  />

                                  {downloadingId ===
                                  document._id
                                    ? "Downloading..."
                                    : "Download"}

                                </button>

                              ) : (

                                <div className="border border-[#33271c] bg-[#0d0a08] px-3 py-2.5 text-center text-[8px] font-bold uppercase tracking-[0.1em] text-[#5e5040]">
                                  Protected action locked
                                </div>

                              )}


                              {document.protectionStatus ===
                                "protected" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewDetails(
                                      document._id,
                                      "secure-link"
                                    )
                                  }
                                  disabled={
                                    isDetailsLoading
                                  }
                                  className="col-span-2 inline-flex items-center justify-center gap-1.5 border border-[#765a37] bg-[#1c140d] px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#c7a36a] transition hover:border-[#a17a49] hover:text-[#e0bd80] disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                  <Link
                                    size={13}
                                    aria-hidden="true"
                                  />

                                  Create Secure Link

                                </button>

                              )}


                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    document._id
                                  )
                                }
                                className="col-span-2 inline-flex items-center justify-center gap-1.5 border border-[#63382f] bg-[#1c100e] px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#c99286] transition hover:border-[#8a4c40] hover:bg-[#281410]"
                              >

                                <Trash2
                                  size={13}
                                  aria-hidden="true"
                                />

                                Delete Case File

                              </button>

                            </div>

                          </div>

                        </article>

                      );
                    }
                  )}

                </div>

              )}

          </div>

        </Card>


        {/* =================================================
            DOCUMENT DETAILS
        ================================================= */}

        {(isDetailsLoading ||
          detailsError ||
          selectedDocument) && (

          <Card
            ref={detailsSectionRef}
            className="scroll-mt-24 border-[#493521] bg-[#15100c] shadow-[0_18px_50px_rgba(0,0,0,0.38)]"
          >

            <div className="flex items-start justify-between gap-5 border-b border-[#3d2e20] pb-6">

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#92734a]">
                  Case record
                </p>

                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#e6dccd]">
                  Document Details
                </h2>

                <p className="mt-1 text-sm text-[#8f8170]">
                  Detailed information about the selected case file.
                </p>

              </div>


              <button
                type="button"
                onClick={closeDetails}
                className="border border-transparent p-2 text-[#806f5c] transition hover:border-[#4b3823] hover:bg-[#21170e] hover:text-[#d0b17c]"
                aria-label="Close document details"
              >

                <X
                  size={19}
                  aria-hidden="true"
                />

              </button>

            </div>


            {isDetailsLoading && (

              <div className="mt-6 border border-[#403225] bg-[#0d0a08] p-8 text-center">

                <Activity
                  size={22}
                  className="mx-auto animate-pulse text-[#92734a]"
                  aria-hidden="true"
                />

                <p className="mt-4 text-sm text-[#8f806e]">
                  Loading case record...
                </p>

              </div>

            )}


            {!isDetailsLoading &&
              detailsError && (

                <div className="mt-6 border border-[#713c32] bg-[#281410] p-4">

                  <p className="text-sm font-medium text-[#dca89b]">
                    {detailsError}
                  </p>

                </div>

              )}


            {!isDetailsLoading &&
              !detailsError &&
              selectedDocument && (

                <>

                  <div className="mt-6 grid gap-px overflow-hidden border border-[#403225] bg-[#403225] sm:grid-cols-2">

                    {[

                      [
                        "Filename",
                        selectedDocument.originalFilename,
                      ],

                      [
                        "File Size",
                        formatFileSize(
                          selectedDocument.fileSize
                        ),
                      ],

                      [
                        "MIME Type",
                        selectedDocument.mimeType,
                      ],

                      [
                        "Protection Status",
                        selectedDocument.protectionStatus,
                      ],

                      [
                        "Password Protected",
                        selectedDocument.isPasswordProtected
                          ? "Yes"
                          : "No",
                      ],

                      [
                        "Download Count",
                        selectedDocument.downloadCount || 0,
                      ],

                      [
                        "Uploaded",
                        formatDateTime(
                          selectedDocument.createdAt
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
                        selectedDocument.lastDownloadedAt
                          ? formatDateTime(
                              selectedDocument.lastDownloadedAt
                            )
                          : "Never",
                      ],

                      [
                        "Expiration",
                        selectedDocument.expiresAt
                          ? formatDateTime(
                              selectedDocument.expiresAt
                            )
                          : "No expiration",
                      ],

                    ].map(([label, value]) => (

                      <div
                        key={label}
                        className="bg-[#0d0a08] p-5"
                      >

                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#705d47]">
                          {label}
                        </p>

                        <p className="mt-2 break-words font-medium text-[#d7cabb]">
                          {value}
                        </p>

                      </div>

                    ))}

                  </div>


                  {selectedDocument.protectionStatus ===
                    "protected" && (

                    <div
                      ref={secureLinkSectionRef}
                      className="mt-7 scroll-mt-24 border border-[#59432b] bg-[#17110c] p-6"
                    >

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#765a37] bg-[#1c140d] text-[#c7a36a]">

                          <Link
                            size={18}
                            aria-hidden="true"
                          />

                        </div>

                        <div>

                          <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#92734a]">
                            Controlled distribution
                          </p>

                          <h3 className="mt-1 font-serif text-lg font-semibold text-[#e4d8c7]">
                            Create Secure Link
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-[#968876]">
                            Create a private 24-hour access link
                            for the protected document.
                          </p>

                        </div>

                      </div>


                      {!secureLinkSuccess && (

                        <div className="mt-6 space-y-5">

                          <div>

                            <label
                              htmlFor="secure-link-recipient-email"
                              className="mb-2 block text-[8px] font-bold uppercase tracking-[0.2em] text-[#806c54]"
                            >
                              Recipient email
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
                              className="w-full rounded-sm border border-[#59432b] bg-[#0d0a08] px-3 py-3 text-sm text-[#e8dfcf] outline-none transition placeholder:text-[#665746] focus:border-[#a17a49] focus:ring-1 focus:ring-[#8b693f] disabled:opacity-50"
                            />

                          </div>


                          <div>

                            <label
                              htmlFor="secure-link-password"
                              className="mb-2 block text-[8px] font-bold uppercase tracking-[0.2em] text-[#806c54]"
                            >
                              Secure-link password
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
                              className="w-full rounded-sm border border-[#59432b] bg-[#0d0a08] px-3 py-3 text-sm text-[#e8dfcf] outline-none transition placeholder:text-[#665746] focus:border-[#a17a49] focus:ring-1 focus:ring-[#8b693f] disabled:opacity-50"
                            />

                            <p className="mt-2 text-xs text-[#756653]">
                              The recipient will need this password
                              to access the PDF.
                            </p>

                          </div>


                          {secureLinkError && (

                            <div className="border border-[#713c32] bg-[#281410] p-3">

                              <p className="text-sm font-medium text-[#dca89b]">
                                {secureLinkError}
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
                            className="inline-flex items-center gap-2 border border-[#a17a49] bg-[#8f6b43] px-4 py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#fff4df] transition hover:bg-[#a17c4c] disabled:cursor-not-allowed disabled:bg-[#403426]"
                          >

                            <Link
                              size={15}
                              aria-hidden="true"
                            />

                            {isCreatingSecureLink
                              ? "Creating..."
                              : "Create Secure Link"}

                          </button>

                        </div>

                      )}


                      {secureLinkSuccess && (

                        <div className="mt-6 space-y-5">

                          <div className="border border-[#56623a] bg-[#18200f] p-4">

                            <p className="text-sm font-semibold text-[#aabd7a]">
                              Secure link created successfully.
                            </p>

                            <p className="mt-1 text-xs text-[#8fa05d]">
                              This link expires in 24 hours.
                            </p>

                          </div>


                          <div>

                            <label
                              htmlFor="generated-secure-link"
                              className="mb-2 block text-[8px] font-bold uppercase tracking-[0.2em] text-[#806c54]"
                            >
                              Secure link
                            </label>

                            <div className="flex flex-col gap-2 sm:flex-row">

                              <input
                                id="generated-secure-link"
                                type="text"
                                value={
                                  secureLinkSuccess.url
                                }
                                readOnly
                                className="min-w-0 flex-1 rounded-sm border border-[#59432b] bg-[#0d0a08] px-3 py-3 text-sm text-[#cfc1ae] outline-none"
                              />

                              <button
                                type="button"
                                onClick={
                                  handleCopySecureLink
                                }
                                className="inline-flex items-center justify-center gap-2 border border-[#59432b] bg-[#17110c] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#bcae9a] transition hover:border-[#987447] hover:text-[#dfbc7d]"
                              >

                                <Copy
                                  size={15}
                                  aria-hidden="true"
                                />

                                Copy

                              </button>

                            </div>

                          </div>


                          <div className="grid gap-px overflow-hidden border border-[#403225] bg-[#403225] sm:grid-cols-2">

                            <div className="bg-[#0d0a08] p-4">

                              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#75634e]">
                                Recipient
                              </p>

                              <p className="mt-2 break-words text-sm font-medium text-[#d8cbb9]">
                                {
                                  secureLinkSuccess.recipientEmail
                                }
                              </p>

                            </div>


                            <div className="bg-[#0d0a08] p-4">

                              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#75634e]">
                                Expires
                              </p>

                              <p className="mt-2 text-sm font-medium text-[#d8cbb9]">
                                {formatDateTime(
                                  secureLinkSuccess.expiresAt
                                )}
                              </p>

                            </div>

                          </div>


                          {secureLinkError && (

                            <div className="border border-[#713c32] bg-[#281410] p-3">

                              <p className="text-sm font-medium text-[#dca89b]">
                                {secureLinkError}
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


        {/* =================================================
            ACCESS HISTORY
        ================================================= */}

        <Card className="border-[#493521] bg-[#15100c] p-0 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">

          <div className="border-b border-[#3d2e20] px-6 py-6 sm:px-8">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#765a37] bg-[#1a130c] text-[#c7a36a]">

                <History
                  size={19}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

              </div>

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#92734a]">
                  Surveillance log
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#e6dccd]">
                  Access History
                </h2>

                <p className="mt-1 text-sm text-[#8f8170]">
                  Recent activity across your protected documents.
                </p>

              </div>

            </div>

          </div>


          <div className="p-6 sm:p-8">

            {accessHistory.length === 0 ? (

              <div className="border border-dashed border-[#59432b] bg-[#0d0a08] px-6 py-14 text-center">

                <History
                  size={28}
                  strokeWidth={1.3}
                  className="mx-auto text-[#765a37]"
                  aria-hidden="true"
                />

                <p className="mt-5 font-serif text-lg font-semibold text-[#d8cbb9]">
                  No activity recorded
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#817260]">
                  Download and access activity will appear
                  here as your vault is used.
                </p>

              </div>

            ) : (

              <div className="overflow-hidden border border-[#493521]">

                <div className="hidden grid-cols-4 gap-4 border-b border-[#493521] bg-[#0d0a08] px-5 py-3 text-[8px] font-bold uppercase tracking-[0.2em] text-[#76634c] sm:grid">

                  <span>Document</span>
                  <span>Action</span>
                  <span>Status</span>
                  <span>Date</span>

                </div>


                <div className="divide-y divide-[#382a1c]">

                  {accessHistory.map((log) => (

                    <div
                      key={log._id}
                      className="grid gap-3 bg-[#15100c] px-5 py-4 transition hover:bg-[#1a140e] sm:grid-cols-4 sm:items-center"
                    >

                      <div className="min-w-0">

                        <p className="truncate font-medium text-[#d8cbb9]">
                          {
                            log.document?.originalFilename ||
                            "Unknown document"
                          }
                        </p>

                      </div>


                      <div>

                        <span className="inline-flex rounded-sm border border-[#4b4032] bg-[#1a1611] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a99c89]">
                          {log.action}
                        </span>

                      </div>


                      <div>

                        <span
                          className={`inline-flex rounded-sm border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${
                            log.success
                              ? "border-[#56623a] bg-[#18200f] text-[#aabd7a]"
                              : "border-[#713c32] bg-[#281410] text-[#dca89b]"
                          }`}
                        >

                          {log.success
                            ? "Successful"
                            : "Failed"}

                        </span>

                      </div>


                      <p className="text-sm text-[#9b8c79]">
                        {new Date(
                          log.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </div>

        </Card>

      </div>

    </DashboardLayout>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <div className="min-h-screen bg-[#0b0907] text-[#e8dfcf]">

      <Navbar />

      <Routes>

        {/* Public */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* Secure link recipient */}

        <Route
          path="/secure/:token"
          element={<SecureLinkAccess />}
        />


        {/* Crypto payment */}

        <Route
          path="/payment/crypto"
          element={<CryptoPayment />}
        />


        {/* Protected */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

        </Route>


        {/* Authentication */}

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
