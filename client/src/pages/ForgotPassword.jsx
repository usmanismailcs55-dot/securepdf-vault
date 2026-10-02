import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Mail,
  LockKeyhole,
} from "lucide-react";

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

      const response = await fetch(
        "https://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to send password reset instructions. Please try again."
        );
        return;
      }

      setMessage(
        data.message ||
          "If an account exists with this email, password reset instructions will be sent."
      );
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.06),transparent_48%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.18),rgba(0,0,0,0.82))]" />

        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle_at_20%_30%,#fff_0.5px,transparent_0.7px)] bg-[length:6px_6px]" />
      </div>

      {/* MAIN FRAME */}
      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1500px] items-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="relative grid w-full overflow-hidden border border-white/15 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.75)] lg:min-h-[680px] lg:grid-cols-[1.35fr_0.65fr]">

          {/* EYES / PHOTOGRAPHIC SIDE */}
          <section className="relative min-h-[390px] overflow-hidden lg:min-h-[680px]">

            <img
              src="/images/noir-vault-hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            />

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.58)_100%)]" />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,transparent_35%,rgba(0,0,0,0.88)_100%)]" />

            <div className="absolute inset-0 bg-white/[0.025] mix-blend-screen" />

            {/* BRAND */}
            <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
              <Link
                to="/"
                className="group flex items-center gap-3"
              >
                <div className="relative flex h-11 w-11 items-center justify-center border border-white/40 bg-black/70 backdrop-blur-sm transition group-hover:border-white/70">
                  <ShieldCheck
                    size={23}
                    strokeWidth={1.5}
                    className="text-white"
                    aria-hidden="true"
                  />

                  <span className="absolute bottom-0 left-0 h-px w-full bg-white/70" />
                </div>

                <div>
                  <div className="font-serif text-lg tracking-[0.12em] text-white">
                    SecurePDF
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-[0.4em] text-white/65">
                    Vault
                  </div>
                </div>
              </Link>
            </div>

            {/* CASE LABEL */}
            <div className="absolute right-6 top-7 z-10 sm:right-8 sm:top-8">
              <div className="border border-white/25 bg-black/55 px-3 py-2 backdrop-blur-sm">
                <span className="text-[8px] uppercase tracking-[0.3em] text-white/70">
                  Account recovery
                </span>
              </div>
            </div>

            {/* BOTTOM CAPTION */}
            <div className="absolute bottom-7 left-6 z-10 sm:bottom-9 sm:left-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-white/70" />

                <span className="text-[9px] uppercase tracking-[0.35em] text-white/75">
                  The Vault
                </span>
              </div>

              <p className="mt-3 max-w-xs font-serif text-xl text-white sm:text-2xl">
                Access can be
                <br />
                restored securely.
              </p>
            </div>
          </section>

          {/* FORM PANEL */}
          <section className="relative flex items-center border-t border-white/15 bg-black px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12">

            <div className="pointer-events-none absolute left-0 top-12 hidden h-32 w-px bg-gradient-to-b from-transparent via-white/45 to-transparent lg:block" />

            <div className="w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-9 flex justify-center lg:hidden">
                <Link
                  to="/"
                  className="flex items-center gap-3"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center border border-white/30 bg-white/[0.04]">
                    <ShieldCheck
                      size={23}
                      strokeWidth={1.5}
                      className="text-white"
                      aria-hidden="true"
                    />

                    <span className="absolute bottom-0 left-0 h-px w-full bg-white/70" />
                  </div>

                  <div>
                    <div className="font-serif text-lg tracking-[0.1em] text-white">
                      SecurePDF
                    </div>

                    <div className="mt-1 text-[9px] uppercase tracking-[0.4em] text-white/55">
                      Vault
                    </div>
                  </div>
                </Link>
              </div>

              {/* HEADING */}
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-9 bg-white/60" />

                  <span className="text-[9px] uppercase tracking-[0.35em] text-white/60">
                    Recovery
                  </span>
                </div>

                <h1 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
                  Forgot password?
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">
                  Enter your email to receive secure reset instructions.
                </p>
              </div>

              {/* FORM CARD */}
              <div className="relative border border-white/15 bg-white/[0.025] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-7">

                {/* Corner details */}
                <span className="absolute left-0 top-0 h-7 w-px bg-white/70" />
                <span className="absolute left-0 top-0 h-px w-7 bg-white/70" />

                <span className="absolute bottom-0 right-0 h-7 w-px bg-white/35" />
                <span className="absolute bottom-0 right-0 h-px w-7 bg-white/35" />

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="mb-6 border border-white/25 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/85"
                  >
                    {error}
                  </div>
                )}

                {/* Success */}
                {message && (
                  <div
                    role="status"
                    className="mb-6 border border-white/25 bg-white/[0.08] px-4 py-3 text-sm leading-6 text-white/85"
                  >
                    {message}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[9px] uppercase tracking-[0.28em] text-white/55"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className="h-12 w-full border border-white/15 bg-black px-4 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/60 focus:ring-1 focus:ring-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <Mail
                        size={17}
                        strokeWidth={1.5}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/35"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex h-12 w-full items-center justify-center gap-3 border border-white bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:bg-white/90 hover:shadow-[0_14px_35px_rgba(0,0,0,0.55)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
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

                {/* Back to login */}
                <div className="mt-7 border-t border-white/10 pt-6">
                  <Link
                    to="/login"
                    className="group flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/60 transition hover:text-white"
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
              <div className="mt-6 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.22em] text-white/30">
                <LockKeyhole
                  size={13}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                Secure account recovery
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
