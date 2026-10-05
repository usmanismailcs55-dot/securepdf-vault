
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Check,
} from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsSuccess(false);

    if (!password || !confirmPassword) {
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `https://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to reset your password. Please try again."
        );
        return;
      }

      setIsSuccess(true);
      setMessage(
        data.message || "Password reset successful. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    {
      label: "8+ characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Number",
      valid: /[0-9]/.test(password),
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-white text-black">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-white" />

      {/* MAIN FRAME */}
      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1500px] items-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="relative grid w-full overflow-hidden border border-black bg-white lg:min-h-[680px] lg:grid-cols-[1.35fr_0.65fr]">
          {/* EYES / PHOTOGRAPHIC SIDE */}
          <section className="relative min-h-[390px] overflow-hidden border-b border-black lg:min-h-[680px] lg:border-b-0">
            <img
              src="/images/noir-vault-hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            />

            <div className="absolute inset-0 bg-black/20" />

            {/* BRAND */}
            <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
              <Link
                to="/"
                className="group flex items-center gap-3 text-black"
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
                  Secure recovery
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
                New key.
                <br />
                Same vault.
              </p>
            </div>
          </section>

          {/* RESET PANEL */}
          <section className="relative flex items-center border-black bg-white px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12">
            <div className="pointer-events-none absolute left-0 top-12 hidden h-32 w-px bg-black lg:block" />

            <div className="w-full max-w-md">
              {/* MOBILE BRAND */}
              <div className="mb-9 flex justify-center lg:hidden">
                <Link
                  to="/"
                  className="flex items-center gap-3 text-black"
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
                    New credentials
                  </span>
                </div>

                <h1 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
                  Reset password
                </h1>

                <p className="mt-3 text-sm leading-6 text-black">
                  Create a new password for your vault.
                </p>
              </div>

              {/* FORM CARD */}
              <div className="relative border border-black bg-white p-6 sm:p-7">
                {/* Corner details */}
                <span className="absolute left-0 top-0 h-7 w-px bg-black" />
                <span className="absolute left-0 top-0 h-px w-7 bg-black" />

                <span className="absolute bottom-0 right-0 h-7 w-px bg-black" />
                <span className="absolute bottom-0 right-0 h-px w-7 bg-black" />

                {/* MESSAGE */}
                {message && (
                  <div
                    role={isSuccess ? "status" : "alert"}
                    className="mb-6 border border-black bg-white px-4 py-3 text-sm leading-6 text-black"
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[9px] uppercase tracking-[0.28em] text-black"
                    >
                      New password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        disabled={isLoading || isSuccess}
                        className="h-12 w-full border border-black bg-white px-4 pr-12 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isSuccess}
                        className="absolute right-2 top-1/2 -translate-y-1/2 border border-black bg-white p-2 text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} strokeWidth={1.5} />
                        ) : (
                          <Eye size={18} strokeWidth={1.5} />
                        )}
                      </button>
                    </div>

                    {/* REQUIREMENTS */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {passwordRequirements.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-1.5 text-[10px] text-black"
                        >
                          <Check size={12} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[9px] uppercase tracking-[0.28em] text-black"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        disabled={isLoading || isSuccess}
                        className="h-12 w-full border border-black bg-white px-4 pr-12 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        disabled={isLoading || isSuccess}
                        className="absolute right-2 top-1/2 -translate-y-1/2 border border-black bg-white p-2 text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} strokeWidth={1.5} />
                        ) : (
                          <Eye size={18} strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="group flex h-12 w-full items-center justify-center gap-3 border border-black bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition duration-300 hover:bg-black hover:text-white active:translate-y-px disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                  >
                    {isLoading ? (
                      "Resetting Password..."
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight
                          size={16}
                          strokeWidth={1.6}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </form>

                {/* SUCCESS LOGIN */}
                {isSuccess && (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 border border-black bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-black hover:text-white"
                  >
                    Go to Login
                    <ArrowRight
                      size={15}
                      strokeWidth={1.5}
                    />
                  </button>
                )}

                {/* BACK */}
                {!isSuccess && (
                  <div className="mt-7 border-t border-black pt-6">
                    <Link
                      to="/login"
                      className="group flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black transition hover:underline"
                    >
                      <ArrowLeft
                        size={14}
                        strokeWidth={1.5}
                        className="transition-transform group-hover:-translate-x-1"
                      />

                      Back to sign in
                    </Link>
                  </div>
                )}
              </div>

              {/* SECURITY LINE */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.22em] text-black">
                <LockKeyhole
                  size={13}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                Secure password recovery
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
