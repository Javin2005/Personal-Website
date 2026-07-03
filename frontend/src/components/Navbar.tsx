import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
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
    <nav
      className="h-16 max-w-4xl mx-auto mt-4 flex justify-between items-center sticky 
      top-4 z-50 backdrop-blur-md bg-slate-900/60 border-2
       border-slate-400/50 rounded-2xl px-8 hover:border-cyan-500/50 group transition-colors"
    >
      <HashLink to="/" className="flex items-center h-full py-2">
        <img src={logo} alt="logo" className="h-full w-auto" />
      </HashLink>

      <ul className="flex gap-6 text-cyan-500 font-bold items-center">
        <li>
          <HashLink to="/archive">Projects</HashLink>
        </li>
        <li>
          <HashLink smooth to="/#about">
            About
          </HashLink>
        </li>
        <li>
          <HashLink to="/Life">Life</HashLink>
        </li>
        {isLoggedIn ? (
          <li>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500/10 text-red-500 border
            border-red-500/20 px-2 py-1 rounded hover:bg-red-500 
            hover:text-white transition-all"
            >
              Logout
            </button>
          </li>
        ) : (
          <li className="opacity-0 hover:opacity-100 transition-opacity">
            <Link to="/login" className="text-[10px text-slate-700">
              Admin
            </Link>
          </li>
        )}
        <li>
          <HashLink smooth to="/#contact">
            Contact
          </HashLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
