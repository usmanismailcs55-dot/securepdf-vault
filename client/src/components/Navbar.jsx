
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LogOut,
  WalletCards,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(
    localStorage.getItem("accessToken")
  );

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#b08a57]/20 bg-[#090806]/96 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
      <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">

        {/* Brand */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3 outline-none"
        >
          <div className="relative flex h-9 w-9 items-center justify-center border border-[#765b38] bg-[#110e0b] transition duration-300 group-hover:border-[#b08a57]">
            <ShieldCheck
              size={19}
              strokeWidth={1.5}
              className="text-[#c7a36a] transition duration-300 group-hover:text-[#e0bd80]"
              aria-hidden="true"
            />

            <span className="absolute bottom-0 left-0 h-px w-full bg-[#b08a57]/60" />
          </div>

          <div className="leading-none">
            <span className="block font-serif text-[15px] font-semibold tracking-[0.12em] text-[#e8dfcf] sm:text-base">
              SecurePDF
            </span>

            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.38em] text-[#92734a]">
              Vault
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Home */}
          <Link
            to="/"
            className="group relative hidden px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9f9381] outline-none transition duration-200 hover:text-[#e0bd80] focus-visible:ring-1 focus-visible:ring-[#b08a57] sm:block"
          >
            Home

            <span className="absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0 bg-[#b08a57] transition-transform duration-200 group-hover:scale-x-100" />
          </Link>

          {isLoggedIn ? (
            <>
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="group relative px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9f9381] outline-none transition duration-200 hover:text-[#e0bd80] focus-visible:ring-1 focus-visible:ring-[#b08a57] sm:px-3"
              >
                Dashboard

                <span className="absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0 bg-[#b08a57] transition-transform duration-200 group-hover:scale-x-100" />
              </Link>

              {/* Crypto Payment */}
              <Link
                to="/payment/crypto"
                className="group flex items-center gap-1.5 px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#9f9381] outline-none transition duration-200 hover:text-[#e0bd80] focus-visible:ring-1 focus-visible:ring-[#b08a57] sm:px-3"
              >
                <WalletCards
                  size={14}
                  strokeWidth={1.5}
                  className="text-[#8f744f] transition-colors duration-200 group-hover:text-[#d0aa70]"
                  aria-hidden="true"
                />

                <span className="hidden sm:inline">
                  Crypto Payment
                </span>

                <span className="sm:hidden">
                  Payment
                </span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 flex items-center gap-2 border border-[#765b38]/60 bg-[#15100c] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#c1b39e] outline-none transition duration-200 hover:border-[#b08a57] hover:bg-[#1c150e] hover:text-[#e0bd80] focus-visible:ring-1 focus-visible:ring-[#b08a57] sm:px-4"
              >
                <LogOut
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="group relative px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9f9381] outline-none transition duration-200 hover:text-[#e0bd80] focus-visible:ring-1 focus-visible:ring-[#b08a57]"
              >
                Login

                <span className="absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0 bg-[#b08a57] transition-transform duration-200 group-hover:scale-x-100" />
              </Link>

              {/* Create Account */}
              <Link
                to="/register"
                className="ml-1 inline-flex items-center border border-[#9a7548] bg-[#8b693f] px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[#fff4df] shadow-[0_8px_25px_rgba(0,0,0,0.35)] outline-none transition duration-200 hover:border-[#d0aa70] hover:bg-[#a07848] hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)] focus-visible:ring-1 focus-visible:ring-[#d0aa70] sm:px-4"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Subtle case-file line */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#b08a57]/20 to-transparent" />
    </nav>
  );
}

export default Navbar;
