import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://localhost:5000/api";

export default function Login({ onLogin }) {
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

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to sign in. Please try again.",
        );
        return;
      }

      if (!data.accessToken) {
        setError(
          "Login succeeded, but no access token was returned.",
        );
        return;
      }

      if (onLogin) {
        onLogin(data.accessToken, data.user);
      } else {
        localStorage.setItem("accessToken", data.accessToken);

        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(data.user),
          );
        }
      }
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

      {/* Login content */}
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
                Vault access
              </span>

              <span className="h-px w-9 bg-black" />
            </div>

            <h1 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
              Sign in
            </h1>

            <p className="mt-3 text-sm leading-6 text-black">
              Enter your credentials to continue.
            </p>
          </div>

          {/* Login form */}
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    type={showPassword ? "text" : "password"}
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
                      setShowPassword((prev) => !prev)
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
                      <EyeOff size={18} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} strokeWidth={1.5} />
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
              aria-hidden="true"
            />

            Secure authentication
          </div>
        </div>
      </section>
    </main>
  );
}