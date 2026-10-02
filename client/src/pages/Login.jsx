import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to sign in. Please try again."
        );
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard");
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

      {/* =========================================================
          FULL PAGE BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.06),transparent_48%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78),rgba(0,0,0,0.18),rgba(0,0,0,0.82))]" />

        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle_at_20%_30%,#fff_0.5px,transparent_0.7px)] bg-[length:6px_6px]" />
      </div>

      {/* =========================================================
          MAIN LAYOUT
      ========================================================== */}

      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1500px] items-center px-4 py-8 sm:px-6 lg:px-10">

        <div className="relative grid w-full overflow-hidden border border-white/15 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.75)] lg:min-h-[700px] lg:grid-cols-[1.35fr_0.65fr]">

          {/* =====================================================
              EYE / PHOTOGRAPHIC VISUAL
          ====================================================== */}

          <section className="relative min-h-[420px] overflow-hidden lg:min-h-[700px]">

            <img
              src="/images/noir-vault-hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            />

            {/* Dark cinematic overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.02)_38%,rgba(0,0,0,0.58)_100%)]" />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,transparent_35%,rgba(0,0,0,0.86)_100%)]" />

            {/* Subtle monochrome tint */}
            <div className="absolute inset-0 bg-white/[0.025] mix-blend-screen" />

            {/* =================================================
                TOP BRAND
            ================================================== */}

            <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">

              <Link
                to="/"
                className="group flex items-center gap-3"
              >
                <div className="relative flex h-11 w-11 items-center justify-center border border-white/40 bg-black/70 backdrop-blur-sm">
                  <ShieldCheck
                    size={23}
                    strokeWidth={1.5}
                    className="text-white"
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

            {/* =================================================
                SMALL CASE LABEL
            ================================================== */}

            <div className="absolute right-6 top-7 z-10 sm:right-8 sm:top-8">
              <div className="border border-white/25 bg-black/55 px-3 py-2 backdrop-blur-sm">
                <span className="text-[8px] uppercase tracking-[0.3em] text-white/70">
                  Secure access
                </span>
              </div>
            </div>

            {/* =================================================
                BOTTOM VISUAL CAPTION
            ================================================== */}

            <div className="absolute bottom-7 left-6 z-10 sm:bottom-9 sm:left-8">

              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-white/70" />

                <span className="text-[9px] uppercase tracking-[0.35em] text-white/75">
                  The Vault
                </span>
              </div>

              <p className="mt-3 max-w-xs font-serif text-xl text-white sm:text-2xl">
                Your documents.
                <br />
                Under your control.
              </p>

            </div>

          </section>

          {/* =====================================================
              LOGIN PANEL
          ====================================================== */}

          <section className="relative flex items-center border-t border-white/15 bg-black px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12">

            {/* Decorative vertical line */}
            <div className="pointer-events-none absolute left-0 top-12 hidden h-32 w-px bg-gradient-to-b from-transparent via-white/45 to-transparent lg:block" />

            <div className="w-full max-w-md">

              {/* Mobile logo */}

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

              {/* =================================================
                  MINIMAL HEADING
              ================================================== */}

              <div className="mb-8">

                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-9 bg-white/60" />

                  <span className="text-[9px] uppercase tracking-[0.35em] text-white/60">
                    Vault access
                  </span>
                </div>

                <h1 className="font-serif text-3xl leading-tight text-white sm:text-4xl">
                  Sign in
                </h1>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Enter your credentials to continue.
                </p>

              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================== */}

              <div className="relative border border-white/15 bg-white/[0.025] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-7">

                {/* Corner details */}
                <span className="absolute left-0 top-0 h-7 w-px bg-white/70" />
                <span className="absolute left-0 top-0 h-px w-7 bg-white/70" />

                <span className="absolute bottom-0 right-0 h-7 w-px bg-white/35" />
                <span className="absolute bottom-0 right-0 h-px w-7 bg-white/35" />

                {error && (
                  <div
                    role="alert"
                    className="mb-6 border border-white/25 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/85"
                  >
                    {error}
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

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/60 focus:ring-1 focus:ring-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Password */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="block text-[9px] uppercase tracking-[0.28em] text-white/55"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-[9px] uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="relative">

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className="h-12 w-full border border-white/15 bg-black px-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/60 focus:ring-1 focus:ring-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff
                            size={18}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <Eye
                            size={18}
                            strokeWidth={1.5}
                          />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* Remember me */}

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded-none border-white/30 bg-black text-white focus:ring-white/30"
                    />

                    <span className="text-xs text-white/45">
                      Remember me
                    </span>

                  </label>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex h-12 w-full items-center justify-center gap-3 border border-white bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:bg-white/90 hover:shadow-[0_14px_35px_rgba(0,0,0,0.55)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      "Signing In..."
                    ) : (
                      <>
                        Enter Vault

                        <ArrowRight
                          size={16}
                          strokeWidth={1.6}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                </form>

                {/* Register */}

                <div className="mt-7 border-t border-white/10 pt-6 text-center">

                  <p className="text-xs text-white/40">
                    Don't have an account?{" "}

                    <Link
                      to="/register"
                      className="font-medium text-white/75 transition hover:text-white"
                    >
                      Create an account
                    </Link>
                  </p>

                </div>

              </div>

              {/* Security line */}

              <div className="mt-6 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.22em] text-white/30">

                <LockKeyhole
                  size={13}
                  strokeWidth={1.5}
                />

                Secure authentication

              </div>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}
