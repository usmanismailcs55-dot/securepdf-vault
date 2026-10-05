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
    } catch {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-white text-black">
      {/* FULL PAGE BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-white" />

      {/* MAIN LAYOUT */}
      <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1500px] items-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="relative grid w-full overflow-hidden border border-black bg-white shadow-sm lg:min-h-[700px] lg:grid-cols-[1.35fr_0.65fr]">
          {/* EYE / PHOTOGRAPHIC VISUAL */}
          <section className="relative min-h-[420px] overflow-hidden bg-white lg:min-h-[700px]">
            <img
              src="/images/noir-vault-hero.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-white opacity-20" />

            {/* TOP BRAND */}
            <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
              <Link
                to="/"
                className="group flex items-center gap-3"
              >
                <div className="relative flex h-11 w-11 items-center justify-center border border-black bg-white transition group-hover:bg-black">
                  <ShieldCheck
                    size={23}
                    strokeWidth={1.5}
                    className="text-black transition group-hover:text-white"
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

            {/* SMALL CASE LABEL */}
            <div className="absolute right-6 top-7 z-10 sm:right-8 sm:top-8">
              <div className="border border-black bg-white px-3 py-2">
                <span className="text-[8px] uppercase tracking-[0.3em] text-black">
                  Secure access
                </span>
              </div>
            </div>

            {/* BOTTOM VISUAL CAPTION */}
            <div className="absolute bottom-7 left-6 z-10 sm:bottom-9 sm:left-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-black" />

                <span className="text-[9px] uppercase tracking-[0.35em] text-black">
                  The Vault
                </span>
              </div>

              <p className="mt-3 max-w-xs font-serif text-xl text-black sm:text-2xl">
                Your documents.
                <br />
                Under your control.
              </p>
            </div>
          </section>

          {/* LOGIN PANEL */}
          <section className="relative flex items-center border-t border-black bg-white px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12">
            {/* Decorative vertical line */}
            <div className="pointer-events-none absolute left-0 top-12 hidden h-32 w-px bg-black lg:block" />

            <div className="w-full max-w-md">
              {/* Mobile logo */}
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

              {/* MINIMAL HEADING */}
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-9 bg-black" />

                  <span className="text-[9px] uppercase tracking-[0.35em] text-black">
                    Vault access
                  </span>
                </div>

                <h1 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
                  Sign in
                </h1>

                <p className="mt-3 text-sm leading-6 text-black">
                  Enter your credentials to continue.
                </p>
              </div>

              {/* LOGIN FORM */}
              <div className="relative border border-black bg-white p-6 shadow-sm sm:p-7">
                {/* Corner details */}
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

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="h-12 w-full border border-black bg-white px-4 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-white"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-[9px] uppercase tracking-[0.28em] text-black"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-[9px] uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
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
                        className="h-12 w-full border border-black bg-white px-4 pr-12 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 border border-black bg-white p-2 text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
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
                      className="h-4 w-4 rounded-none border border-black bg-white text-black focus:ring-1 focus:ring-black"
                    />

                    <span className="text-xs text-black">
                      Remember me
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex h-12 w-full items-center justify-center gap-3 border border-black bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-black transition duration-300 hover:bg-black hover:text-white active:translate-y-px disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
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
                <div className="mt-7 border-t border-black pt-6 text-center">
                  <p className="text-xs text-black">
                    Don't have an account?{" "}

                    <Link
                      to="/register"
                      className="font-medium text-black transition hover:bg-black hover:text-white"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>

              {/* Security line */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.22em] text-black">
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
