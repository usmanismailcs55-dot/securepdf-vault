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
    <nav className="sticky top-0 z-50 w-full border-b border-[#4b3823] bg-[#0b0907]/95 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">

        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#b08a57]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center border border-[#765a37] bg-[#15100b] shadow-[inset_0_0_20px_rgba(176,138,87,0.08)] transition duration-300 group-hover:border-[#b08a57] group-hover:shadow-[inset_0_0_24px_rgba(176,138,87,0.14)]">
            <ShieldCheck
              size={21}
              strokeWidth={1.6}
              className="text-[#c7a36a] transition duration-300 group-hover:text-[#e0bd80]"
              aria-hidden="true"
            />

            <span className="absolute bottom-0 left-0 h-px w-full bg-[#765a37]" />
          </div>

          <div className="leading-none">
            <span className="block font-serif text-base font-semibold tracking-[0.1em] text-[#e8dfcf] sm:text-lg">
              SecurePDF
            </span>

            <span className="mt-1.5 block text-[9px] font-medium uppercase tracking-[0.34em] text-[#92734a]">
              Vault
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 text-xs font-medium sm:gap-2 sm:text-sm">

          {/* Home */}
          <Link
            to="/"
            className="rounded-sm border border-transparent px-3 py-2 text-[#b9ad9a] outline-none transition duration-200 hover:border-[#4b3823] hover:bg-[#15100b] hover:text-[#dfbc7d] focus-visible:ring-2 focus-visible:ring-[#b08a57]"
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="rounded-sm border border-transparent px-3 py-2 text-[#b9ad9a] outline-none transition duration-200 hover:border-[#4b3823] hover:bg-[#15100b] hover:text-[#dfbc7d] focus-visible:ring-2 focus-visible:ring-[#b08a57]"
              >
                Dashboard
              </Link>

              {/* Crypto Payment */}
              <Link
                to="/payment/crypto"
                className="flex items-center gap-1.5 rounded-sm border border-transparent px-3 py-2 text-[#b9ad9a] outline-none transition duration-200 hover:border-[#4b3823] hover:bg-[#15100b] hover:text-[#dfbc7d] focus-visible:ring-2 focus-visible:ring-[#b08a57]"
              >
                <WalletCards
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Crypto Payment
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 flex items-center gap-2 rounded-sm border border-[#5a4329] bg-[#17110b] px-3 py-2 font-semibold text-[#c1b39e] outline-none transition duration-200 hover:border-[#9a7447] hover:bg-[#21170e] hover:text-[#e0bd80] focus-visible:ring-2 focus-visible:ring-[#b08a57] sm:px-4"
              >
                <LogOut
                  size={15}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="rounded-sm border border-transparent px-3 py-2 text-[#b9ad9a] outline-none transition duration-200 hover:border-[#4b3823] hover:bg-[#15100b] hover:text-[#dfbc7d] focus-visible:ring-2 focus-visible:ring-[#b08a57]"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="ml-1 rounded-sm border border-[#8b693f] bg-[#8b693f] px-4 py-2 font-semibold tracking-wide text-[#fff4df] shadow-[0_5px_20px_rgba(0,0,0,0.3)] outline-none transition duration-200 hover:border-[#b08a57] hover:bg-[#a47b49] hover:shadow-[0_7px_26px_rgba(0,0,0,0.4)] focus-visible:ring-2 focus-visible:ring-[#d0aa70]"
              >
                Create Account
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;