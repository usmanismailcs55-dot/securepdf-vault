import { useState } from "react";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
} from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "https://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create your account. Please try again."
        );
        return;
      }

      setSuccess(
        data.message ||
          "Registration successful. Please verify your email address."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    {
      label: "8+ characters",
      valid: formData.password.length >= 8,
    },
    {
      label: "Uppercase",
      valid: /[A-Z]/.test(formData.password),
    },
    {
      label: "Number",
      valid: /[0-9]/.test(formData.password),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="relative grid min-h-[calc(100vh-1.5rem)] w-full overflow-hidden border border-black bg-white shadow-sm sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.15fr_0.85fr]">

          {/* PHOTO SIDE */}
          <div className="relative min-h-[360px] overflow-hidden bg-white lg:min-h-0">

            {/* Actual eyes photography */}
            <img
              src="/images/noir-vault-hero.jpg"
              alt="Eyes in cinematic darkness"
              className="absolute inset-0 h-full w-full object-cover object-center grayscale"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-white opacity-20" />

            {/* Top brand */}
            <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-black bg-white">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.6}
                    className="text-black"
                    aria-hidden="true"
                  />
                </div>

                <div className="leading-none">
                  <p className="font-serif text-sm tracking-[0.14em] text-black">
                    SecurePDF
                  </p>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.38em] text-black">
                    Vault
                  </p>
                </div>
              </div>
            </div>

            {/* Minimal image caption */}
            <div className="absolute bottom-6 left-5 right-5 z-10 sm:bottom-8 sm:left-8 sm:right-8">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.38em] text-black">
                    Private access
                  </p>

                  <p className="mt-2 max-w-xs font-serif text-xl leading-tight text-black sm:text-2xl">
                    Your files.
                    <br />
                    Under your control.
                  </p>
                </div>

                <span className="hidden border-l border-black pl-4 text-[9px] uppercase tracking-[0.28em] text-black sm:block">
                  01 / 04
                </span>
              </div>
            </div>
          </div>

          {/* REGISTER SIDE */}
          <div className="relative flex items-center justify-center overflow-y-auto bg-white px-5 py-10 sm:px-8 lg:px-12">

            <div className="relative z-10 w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-9 flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center border border-black bg-white">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.6}
                    className="text-black"
                    aria-hidden="true"
                  />
                </div>

                <div className="leading-none">
                  <p className="font-serif text-sm tracking-[0.14em] text-black">
                    SecurePDF
                  </p>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.38em] text-black">
                    Vault
                  </p>
                </div>
              </div>

              {/* Minimal heading */}
              <div className="mb-7">
                <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.36em] text-black">
                  New identity
                </p>

                <h1 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
                  Create your vault.
                </h1>

                <div className="mt-4 h-px w-16 bg-black" />
              </div>

              {/* Form */}
              <div className="border border-black bg-white p-5 shadow-sm sm:p-7">

                {error && (
                  <div
                    role="alert"
                    className="mb-5 border border-black bg-white px-4 py-3 text-sm leading-5 text-black"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="mb-5 border border-black bg-white px-4 py-3 text-sm leading-5 text-black"
                  >
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-black"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isLoading}
                      className="h-12 w-full border border-black bg-white px-4 text-sm text-black outline-none transition placeholder:text-black hover:border-black focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-black"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-12 w-full border border-black bg-white px-4 text-sm text-black outline-none transition placeholder:text-black hover:border-black focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-white"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-black"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-12 w-full border border-black bg-white px-4 pr-12 text-sm text-black outline-none transition placeholder:text-black hover:border-black focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
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
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {/* Password requirements */}
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

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-black"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="h-12 w-full border border-black bg-white px-4 pr-12 text-sm text-black outline-none transition placeholder:text-black hover:border-black focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 border border-black bg-white p-2 text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="border-l border-black bg-white px-4 py-3">
                    <p className="text-[11px] leading-5 text-black">
                      By creating an account, you agree to our{" "}
                      <a
                        href="/terms"
                        className="font-medium text-black transition hover:bg-black hover:text-white"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="font-medium text-black transition hover:bg-black hover:text-white"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex h-12 w-full items-center justify-center gap-2 border border-black bg-white px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white active:scale-[0.995] disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                  >
                    {isLoading
                      ? "Creating Account..."
                      : "Create Secure Account"}

                    {!isLoading && (
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </form>

                {/* Login */}
                <div className="mt-6 border-t border-black pt-5 text-center">
                  <p className="text-xs text-black">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="font-medium text-black transition hover:bg-black hover:text-white"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </div>

              {/* Minimal footer */}
              <div className="mt-5 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-black">
                <span>Private vault</span>
                <span>Secure access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
