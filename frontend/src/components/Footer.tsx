import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../auth";
import { useSite } from "../site/useSite";

interface GithubStatus {
  active: boolean;
  repo?: string;
  message?: string;
}

interface SpotifyStatus {
  active: boolean;
  track?: string;
  artist?: string;
  link?: string;
}

// Latest commit and current song, refreshed every 30 seconds while the
// tab is visible. The backend caches the answers, so this is cheap.
function StatusLine() {
  const [github, setGithub] = useState<GithubStatus | null>(null);
  const [spotify, setSpotify] = useState<SpotifyStatus | null>(null);

  useEffect(() => {
    const load = () => {
      if (document.hidden) return;
      fetch(`${API_URL}/api/status/github`)
        .then((res) => res.json())
        .then((data: GithubStatus) => setGithub(data.active ? data : null))
        .catch(() => {});
      fetch(`${API_URL}/api/status/spotify`)
        .then((res) => res.json())
        .then((data: SpotifyStatus) => setSpotify(data.active ? data : null))
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 30000);
    document.addEventListener("visibilitychange", load);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  if (!github && !spotify) return null;

  return (
    <div className="grid gap-1 font-mono text-xs text-muted">
      {github && (
        <p>
          <span className="text-accent2">last commit</span> {github.repo}: {github.message}
        </p>
      )}
      {spotify && (
        <p>
          <span className="text-accent2">listening to</span>{" "}
          <a href={spotify.link} target="_blank" rel="noreferrer" className="hover:text-accent">
            {spotify.track} by {spotify.artist}
          </a>
        </p>
      )}
    </div>
  );
}

export default function Footer() {
  const { site } = useSite();
  const { settings, about } = site;

  return (
    <footer className="relative z-10 grid gap-6 border-t border-text/10 px-[max(20px,6vw)] pt-10 pb-12 text-sm text-muted md:grid-cols-2">
      <div className="grid content-start gap-2">
        <p className="text-text/80">© {new Date().getFullYear()} {about?.name ?? "Christian J. Carlson"}</p>
        {settings.footerNote && <p>{settings.footerNote}</p>}
        <Link to="/login" className="w-fit font-mono text-xs text-muted/60 hover:text-accent">
          sign in
        </Link>
      </div>
      {settings.showStatus && <StatusLine />}
    </footer>
  );
}
