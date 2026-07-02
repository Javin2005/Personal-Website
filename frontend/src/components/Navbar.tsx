import { HashLink } from "react-router-hash-link";
import logo from "../assets/cjc.svg";

function Navbar() {
  return (
    <nav
      className="h-16 max-w-4xl mx-auto mt-4 flex justify-between items-center sticky 
      top-4 z-50 backdrop-blur-md bg-slate-900/60 border-2
       border-slate-400/50 rounded-2xl px-8 hover:border-cyan-500/50 group transition-colors"
    >
      <HashLink to="/" className="flex items-center h-full py-2">
        <img src={logo} alt="logo" className="h-full w-auto" />
      </HashLink>

      <ul className="flex gap-6 text-cyan-500 font-bold">
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
