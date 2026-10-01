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
    <div className="min-h-screen bg-[#080706] text-[#e8dfcf]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="relative grid min-h-[calc(100vh-1.5rem)] w-full overflow-hidden border border-[#493823] bg-[#0b0907] shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[1.15fr_0.85fr]">

          {/* PHOTO SIDE */}
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-0">

            {/* Actual eyes photography */}
            <img
              src="/images/noir-vault-hero.jpg"
              alt="Eyes in cinematic darkness"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,4,3,0.62)_0%,rgba(5,4,3,0.08)_34%,rgba(5,4,3,0.18)_58%,rgba(5,4,3,0.9)_100%)]" />

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,6,0.38)_0%,transparent_45%,rgba(8,7,6,0.22)_100%)]" />

            {/* Top brand */}
            <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-[#9b774a]/70 bg-[#0b0907]/70 backdrop-blur-sm">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.6}
                    className="text-[#d2ae72]"
                    aria-hidden="true"
                  />
                </div>

                <div className="leading-none">
                  <p className="font-serif text-sm tracking-[0.14em] text-[#eee3d0]">
                    SecurePDF
                  </p>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.38em] text-[#a5875c]">
                    Vault
                  </p>
                </div>
              </div>
            </div>

            {/* Minimal image caption */}
            <div className="absolute bottom-6 left-5 right-5 z-10 sm:bottom-8 sm:left-8 sm:right-8">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.38em] text-[#c5a16a]">
                    Private access
                  </p>

                  <p className="mt-2 max-w-xs font-serif text-xl leading-tight text-[#f0e5d2] sm:text-2xl">
                    Your files.
                    <br />
                    Under your control.
                  </p>
                </div>

                <span className="hidden border-l border-[#b08a57]/40 pl-4 text-[9px] uppercase tracking-[0.28em] text-[#a9967c] sm:block">
                  01 / 04
                </span>
              </div>
            </div>
          </div>

          {/* REGISTER SIDE */}
          <div className="relative flex items-center justify-center overflow-y-auto bg-[linear-gradient(135deg,#100d09_0%,#0c0a08_55%,#080706_100%)] px-5 py-10 sm:px-8 lg:px-12">

            {/* Subtle background glow */}
            <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-[#9b774a]/[0.06] blur-3xl" />

            <div className="relative z-10 w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-9 flex items-center gap-3 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center border border-[#765a37] bg-[#15100b]">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.6}
                    className="text-[#c7a36a]"
                    aria-hidden="true"
                  />
                </div>

                <div className="leading-none">
                  <p className="font-serif text-sm tracking-[0.14em] text-[#eee3d0]">
                    SecurePDF
                  </p>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.38em] text-[#92734a]">
                    Vault
                  </p>
                </div>
              </div>

              {/* Minimal heading */}
              <div className="mb-7">
                <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.36em] text-[#a5875c]">
                  New identity
                </p>

                <h1 className="font-serif text-3xl leading-tight text-[#eee3d0] sm:text-4xl">
                  Create your vault.
                </h1>

                <div className="mt-4 h-px w-16 bg-[#9a7547]" />
              </div>

              {/* Form */}
              <div className="border border-[#493823] bg-[#100d09]/90 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.42)] backdrop-blur-sm sm:p-7">

                {error && (
                  <div
                    role="alert"
                    className="mb-5 border border-[#704039] bg-[#24120f] px-4 py-3 text-sm leading-5 text-[#d9a49a]"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="mb-5 border border-[#53613f] bg-[#151b10] px-4 py-3 text-sm leading-5 text-[#b8c99b]"
                  >
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#a9967c]"
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
                      className="h-12 w-full border border-[#493823] bg-[#0b0907] px-4 text-sm text-[#eee3d0] outline-none transition placeholder:text-[#625747] hover:border-[#695236] focus:border-[#a78351] focus:bg-[#0f0c09] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#a9967c]"
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
                      className="h-12 w-full border border-[#493823] bg-[#0b0907] px-4 text-sm text-[#eee3d0] outline-none transition placeholder:text-[#625747] hover:border-[#695236] focus:border-[#a78351] focus:bg-[#0f0c09] disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#a9967c]"
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
                        className="h-12 w-full border border-[#493823] bg-[#0b0907] px-4 pr-12 text-sm text-[#eee3d0] outline-none transition placeholder:text-[#625747] hover:border-[#695236] focus:border-[#a78351] focus:bg-[#0f0c09] disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#766652] transition hover:text-[#c7a36a] disabled:cursor-not-allowed disabled:opacity-40"
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
                          className={`flex items-center gap-1.5 text-[10px] ${
                            item.valid
                              ? "text-[#b79a69]"
                              : "text-[#665a4b]"
                          }`}
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
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#a9967c]"
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
                        className="h-12 w-full border border-[#493823] bg-[#0b0907] px-4 pr-12 text-sm text-[#eee3d0] outline-none transition placeholder:text-[#625747] hover:border-[#695236] focus:border-[#a78351] focus:bg-[#0f0c09] disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#766652] transition hover:text-[#c7a36a] disabled:cursor-not-allowed disabled:opacity-40"
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
                  <div className="border-l border-[#765a37] bg-[#15100b] px-4 py-3">
                    <p className="text-[11px] leading-5 text-[#827565]">
                      By creating an account, you agree to our{" "}
                      <a
                        href="/terms"
                        className="text-[#b99a67] transition hover:text-[#e0bd80]"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-[#b99a67] transition hover:text-[#e0bd80]"
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
                    className="group flex h-12 w-full items-center justify-center gap-2 border border-[#9a7547] bg-[#8b693f] px-5 text-sm font-semibold text-[#fff3dd] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:border-[#c19a61] hover:bg-[#a07a49] hover:shadow-[0_12px_35px_rgba(0,0,0,0.42)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="mt-6 border-t border-[#302419] pt-5 text-center">
                  <p className="text-xs text-[#786c5c]">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="font-medium text-[#b99a67] transition hover:text-[#dfbc7d]"
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </div>

              {/* Minimal footer */}
              <div className="mt-5 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-[#625747]">
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