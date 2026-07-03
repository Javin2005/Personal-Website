import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { ShieldCheck, LogOut } from "lucide-react";
import logo from "../assets/cjc.svg";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="h-16 max-w-5xl mx-auto mt-4 flex justify-between items-center sticky top-4 z-50 backdrop-blur-md bg-slate-900/60 border border-slate-400/20 rounded-2xl px-8 transition-all">
      <Link to="/" className="flex items-center h-full py-2">
        <img src={logo} alt="logo" className="h-full w-auto" />
      </Link>

      <ul className="flex gap-8 text-cyan-500 font-bold items-center">
        <li>
          <Link to="/archive" className="hover:text-white transition-colors">
            Projects
          </Link>
        </li>
        <li>
          <HashLink
            smooth
            to="/#about"
            className="hover:text-white transition-colors"
          >
            About
          </HashLink>
        </li>
        <li>
          <Link to="/life" className="hover:text-white transition-colors">
            Life
          </Link>
        </li>
        <li>
          <HashLink
            smooth
            to="/#contact"
            className="hover:text-white transition-colors"
          >
            Contact
          </HashLink>
        </li>

        {isLoggedIn ? (
          <li className="pl-4 border-l border-slate-700">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[10px] uppercase tracking-tighter text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </li>
        ) : (
          <li className="pl-4 border-l border-slate-700 opacity-20 hover:opacity-100 transition-opacity">
            <Link to="/login" className="text-slate-500 hover:text-cyan-400">
              <ShieldCheck size={18} />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
