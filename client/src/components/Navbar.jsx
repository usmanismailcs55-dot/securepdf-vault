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
    <nav className="sticky top-0 z-50 w-full border-b border-black bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">

        {/* Brand */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3 outline-none"
        >
          <div className="relative flex h-9 w-9 items-center justify-center border border-black bg-white transition duration-300 group-hover:bg-black">
            <ShieldCheck
              size={19}
              strokeWidth={1.5}
              className="text-black transition duration-300 group-hover:text-white"
              aria-hidden="true"
            />

            <span className="absolute bottom-0 left-0 h-px w-full bg-black group-hover:bg-white" />
          </div>

          <div className="leading-none">
            <span className="block font-serif text-[15px] font-semibold tracking-[0.12em] text-black sm:text-base">
              SecurePDF
            </span>

            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.38em] text-black">
              Vault
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Home */}
          <Link
            to="/"
            className="group relative hidden px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black outline-none transition duration-200 hover:bg-black hover:text-white focus-visible:ring-1 focus-visible:ring-black sm:block"
          >
            Home

            <span className="absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0 bg-black transition-transform duration-200 group-hover:scale-x-100 group-hover:bg-white" />
          </Link>

          {isLoggedIn ? (
            <>
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="group relative px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-black outline-none transition duration-200 hover:bg-black hover:text-white focus-visible:ring-1 focus-visible:ring-black sm:px-3"
              >
                Dashboard

                <span className="absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0 bg-black transition-transform duration-200 group-hover:scale-x-100 group-hover:bg-white" />
              </Link>

              {/* Crypto Payment */}
              <Link
                to="/payment/crypto"
                className="group flex items-center gap-1.5 px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-black outline-none transition duration-200 hover:bg-black hover:text-white focus-visible:ring-1 focus-visible:ring-black sm:px-3"
              >
                <WalletCards
                  size={14}
                  strokeWidth={1.5}
                  className="text-black transition-colors duration-200 group-hover:text-white"
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
                className="ml-1 flex items-center gap-2 border border-black bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-black outline-none transition duration-200 hover:border-black hover:bg-black hover:text-white focus-visible:ring-1 focus-visible:ring-black sm:px-4"
              >
                <LogOut
                  size={14}
                  strokeWidth={1.5}
                  className="text-black group-hover:text-white"
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
                className="group relative px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black outline-none transition duration-200 hover:bg-black hover:text-white focus-visible:ring-1 focus-visible:ring-black"
              >
                Login

                <span className="absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0 bg-black transition-transform duration-200 group-hover:scale-x-100 group-hover:bg-white" />
              </Link>

              {/* Create Account */}
              <Link
                to="/register"
                className="ml-1 inline-flex items-center border border-black bg-white px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.17em] text-black shadow-[0_8px_25px_rgba(0,0,0,0.12)] outline-none transition duration-200 hover:bg-black hover:text-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] focus-visible:ring-1 focus-visible:ring-black sm:px-4"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Subtle case-file line */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-black" />
    </nav>
  );
}

export default Navbar;
