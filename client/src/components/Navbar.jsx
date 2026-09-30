import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut, WalletCards } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md text-base font-bold text-slate-900 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-lg"
        >
          <ShieldCheck
            size={22}
            className="text-indigo-600 sm:h-6 sm:w-6"
          />

          SecurePDF Vault
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium sm:gap-4">

          {/* Home */}
          <Link
            to="/"
            className="rounded-md px-2 py-2 text-slate-600 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className="rounded-md px-2 py-2 text-slate-600 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Dashboard
              </Link>

              {/* Crypto Payment */}
              <Link
                to="/payment/crypto"
                className="flex items-center gap-1.5 rounded-md px-2 py-2 text-slate-600 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <WalletCards size={16} />
                Crypto Payment
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 outline-none transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="rounded-md px-2 py-2 text-slate-600 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm outline-none transition hover:bg-indigo-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
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
