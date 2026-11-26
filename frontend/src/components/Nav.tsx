import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { isLoggedIn, logout } from "../auth";
import { useLabels } from "../site/labels";
import { useSite } from "../site/useSite";

// A link from the admin settings can point to a page ("/projects"), a
// section ("/#contact") or another site ("https://..."). Each needs a
// different kind of link component.
function NavItem({ href, label }: { href: string; label: string }) {
  const className = "text-text/75 transition-colors hover:text-accent";
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  if (href.includes("#")) {
    return (
      <HashLink smooth to={href.startsWith("#") ? `/${href}` : href} className={className}>
        {label}
      </HashLink>
    );
  }
  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

export default function Nav() {
  const { site } = useSite();
  const t = useLabels();
  const navigate = useNavigate();
  useLocation(); // re-render on page change, so the admin links appear right after logging in
  const [scrolled, setScrolled] = useState(false);
  const loggedIn = isLoggedIn();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? "border-b border-text/10 bg-bg/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="flex items-center justify-between gap-6 px-[max(20px,6vw)] py-4">
        <Link to="/" className="font-mono text-sm tracking-[0.08em] text-text hover:text-accent">
          {t("logo") ||
            initials(site.about?.name ?? `${site.settings.hero.firstLine} ${site.settings.hero.secondLine}`)}
        </Link>
        <ul className="flex items-center gap-x-6 gap-y-1 overflow-x-auto text-sm whitespace-nowrap">
          {site.settings.nav.map((item) => (
            <li key={item.href + item.label}>
              <NavItem {...item} />
            </li>
          ))}
          {loggedIn && (
            <>
              <li>
                <Link to="/admin" className="text-accent2 hover:text-accent">
                  {t("adminLink")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="cursor-pointer text-muted hover:text-accent"
                >
                  {t("signOut")}
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

// "Christian J. Carlson" -> "CJC"
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-zÅÄÖåäö]/g, "")[0] ?? "")
    .join("")
    .toUpperCase();
}
