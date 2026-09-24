
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

function Navbar() {
  return (
    <nav className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md text-base font-bold text-slate-900 outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:text-lg"
        >
          <ShieldCheck size={22} className="text-indigo-600 sm:h-6 sm:w-6" />
          SecurePDF Vault
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-600 sm:gap-6">
          <Link
            to="/"
            className="rounded-md outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className="rounded-md outline-none transition hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

