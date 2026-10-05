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
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-white text-black">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-white" />

      {/* MAIN FRAME */}
      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1500px] items-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="relative grid w-full overflow-hidden border border-black bg-white shadow-sm lg:min-h-[680px] lg:grid-cols-[1.35fr_0.65fr]">

          {/* EYES / PHOTOGRAPHIC SIDE */}
          <section className="relative min-h-[390px] overflow-hidden bg-white lg:min-h-[680px]">

            <img
              src="/images/noir-vault-hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-white opacity-20" />

            {/* BRAND */}
            <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
              <Link
                to="/"
                className="group flex items-center gap-3"
              >
                <div className="relative flex h-11 w-11 items-center justify-center border border-black bg-white transition group-hover:bg-black group-hover:text-white">
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

            {/* CASE LABEL */}
            <div className="absolute right-6 top-7 z-10 sm:right-8 sm:top-8">
              <div className="border border-black bg-white px-3 py-2">
                <span className="text-[8px] uppercase tracking-[0.3em] text-black">
                  Account recovery
                </span>
              </div>
            </div>

            {/* BOTTOM CAPTION */}
            <div className="absolute bottom-7 left-6 z-10 sm:bottom-9 sm:left-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-black" />

                <span className="text-[9px] uppercase tracking-[0.35em] text-black">
                  The Vault
                </span>
              </div>

              <p className="mt-3 max-w-xs font-serif text-xl text-black sm:text-2xl">
                Access can be
                <br />
                restored securely.
              </p>
            </div>
          </section>

          {/* FORM PANEL */}
          <section className="relative flex items-center border-t border-black bg-white px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12">

            <div className="pointer-events-none absolute left-0 top-12 hidden h-32 w-px bg-black lg:block" />

            <div className="w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-9 flex justify-center lg:hidden">
                <Link
                  to="/"
                  className="flex items-center gap-3"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center border border-black bg-white">
                    <ShieldCheck
                      size={23}
                      strokeWidth={1.5}
                      className="text-black"
                      aria-hidden="true"
                    />

                    <span className="absolute bottom-0 left-0 h-px w-full bg-black" />
                  </div>

                  <div>
                    <div className="font-serif text-lg tracking-[0.1em] text-black">
                      SecurePDF
                    </div>

                    <div className="mt-1 text-[9px] uppercase tracking-[0.4em] text-black">
                      Vault
                    </div>
                  </div>
                </Link>
              </div>

              {/* HEADING */}
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-9 bg-black" />

                  <span className="text-[9px] uppercase tracking-[0.35em] text-black">
                    Recovery
                  </span>
                </div>

                <h1 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
                  Forgot password?
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-6 text-black">
                  Enter your email to receive secure reset instructions.
                </p>
              </div>

              {/* FORM CARD */}
              <div className="relative border border-black bg-white p-6 shadow-sm sm:p-7">

                {/* Corner details */}
                <span className="absolute left-0 top-0 h-7 w-px bg-black" />
                <span className="absolute left-0 top-0 h-px w-7 bg-black" />

                <span className="absolute bottom-0 right-0 h-7 w-px bg-black" />
                <span className="absolute bottom-0 right-0 h-px w-7 bg-black" />

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="mb-6 border border-black bg-white px-4 py-3 text-sm leading-6 text-black"
                  >
                    {error}
                  </div>
                )}

                {/* Success */}
                {message && (
                  <div
                    role="status"
                    className="mb-6 border border-black bg-white px-4 py-3 text-sm leading-6 text-black"
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
                      className="mb-2 block text-[9px] uppercase tracking-[0.28em] text-black"
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

                  {/* Submit */}
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

                {/* Back to login */}
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
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
