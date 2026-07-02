import { Link } from "react-router-dom";
import logo from "../assets/cjc.svg";

function Navbar() {
  return (
    <nav
      className="h-16 max-w-4xl mx-auto mt-4 flex justify-between items-center sticky 
      top-4 z-50 backdrop-blur-md bg-slate-900/60 border-2
       border-slate-400/50 rounded-2xl px-8 hover:border-cyan-500/50 group transition-colors"
    >
      <Link to="/" className="flex items-center h-full py-2">
        <img src={logo} alt="logo" className="h-full w-auto" />
      </Link>

      <ul className="flex gap-6 text-cyan-500 font-bold">
        <li>
          <Link to="/archive">Projects</Link>
        </li>
        <li>
          <Link to="/#about">About</Link>
        </li>
        <li>
          <Link to="/Life">Life</Link>
        </li>
        <li>
          <Link to="/Contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
