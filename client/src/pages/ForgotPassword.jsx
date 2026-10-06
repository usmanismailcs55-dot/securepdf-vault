import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Mail,
  LockKeyhole,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://localhost:5000/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to send password reset instructions. Please try again.",
        );
        return;
      }

      setMessage(
        data.message ||
          "If an account exists with this email, password reset instructions will be sent.",
      );
    } catch {
      setError(
        "Unable to connect to the server. Please make sure the backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-white text-black">
      {/* Standalone image */}
      <section className="w-full bg-white">
        <div className="w-full overflow-hidden">
          <img
            src="/images/noir-vault-hero.jpg"
            alt="Noir eyes"
            className="block h-[55vh] min-h-[420px] w-full object-cover object-center grayscale sm:h-[65vh] lg:h-[72vh]"
          />
        </div>
      </section>

      {/* Recovery content */}
      <section className="w-full bg-white px-4 py-12 text-black sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-2xl">
          {/* Brand */}
          <div className="mb-10 flex justify-center">
            <Link
              to="/"
              className="group flex items-center gap-3 text-black"
            >
              <div className="relative flex h-11 w-11 items-center justify-center border border-black bg-white transition group-hover:bg-black">
                <ShieldCheck
                  size={23}
                  strokeWidth={1.5}
                  className="text-black transition group-hover:text-white"
                  aria-hidden="true"
                />

                <span className="absolute bottom-0 left-0 h-px w-full bg-black" />
              </div>

              <div>
                <div className="font-serif text-lg tracking-[0.12em] text-black">
                  SecurePDF
                </div>

                <div className="mt-1 text-[9px] uppercase tracking-[0.4em] text-black">
                  Vault
                </div>
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-9 bg-black" />

              <span className="text-[9px] uppercase tracking-[0.35em] text-black">
                Recovery
              </span>

              <span className="h-px w-9 bg-black" />
            </div>

            <h1 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
              Forgot password?
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black">
              Enter your email to receive secure reset instructions.
            </p>
          </div>

          {/* Form */}
          <div className="relative border border-black bg-white p-6 shadow-sm sm:p-8">
            <span className="absolute left-0 top-0 h-7 w-px bg-black" />
            <span className="absolute left-0 top-0 h-px w-7 bg-black" />

            <span className="absolute bottom-0 right-0 h-7 w-px bg-black" />
            <span className="absolute bottom-0 right-0 h-px w-7 bg-black" />

            {error && (
              <div
                role="alert"
                className="mb-6 border border-black bg-white px-4 py-3 text-sm leading-6 text-black"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-6 border border-black bg-white px-4 py-3 text-sm leading-6 text-black"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[9px] uppercase tracking-[0.28em] text-black"
                >
                  Email address
                </label>

                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-12 w-full border border-black bg-white px-4 pr-11 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-white"
                  />

                  <Mail
                    size={17}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-3 border border-black bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition duration-300 hover:bg-black hover:text-white active:translate-y-px disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
              >
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Reset Instructions

                    <ArrowRight
                      size={16}
                      strokeWidth={1.6}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-black pt-6">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black transition hover:bg-black hover:text-white"
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:-translate-x-1"
                />

                Back to sign in
              </Link>
            </div>
          </div>

          {/* Security line */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.22em] text-black">
            <LockKeyhole
              size={13}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            Secure account recovery
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;