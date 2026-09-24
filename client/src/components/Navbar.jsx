
import { Link } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";

function Navbar() {
  const handleLogout = () => {
    console.log("Logout clicked");
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
        <div className="flex items-center gap-3 text-sm font-medium sm:gap-6">
          
          <Link
            to="/"
            className="rounded-md px-2 py-2 text-slate-600 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className="rounded-md px-2 py-2 text-slate-600 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Dashboard
          </Link>

          {/* Register */}
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm outline-none transition hover:bg-indigo-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Create Account
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

        </div>
      </div>
    </nav>
  );
}

export default Navbar;

