import { useState, useEffect } from "react";
import { GitBranch, Music } from "lucide-react";

export default function StatusBar() {
  const [github, setGithub] = useState<any>(null);
  const [spotify, setSpotify] = useState<any>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API_URL}/api/status/github`)
        .then((res) => res.json())
        .then((data) => data.active && setGithub(data));

      fetch(`${API_URL}/api/status/spotify`)
        .then((res) => res.json())
        .then((data) => setSpotify(data.active ? data : null));
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-cyan-500/5 border-b border-cyan-500/10 py-1.5 px-4 overflow-hidden backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-cyan-500/60">
        <div className="flex items-center gap-2"></div>

        <div className="flex items-center gap-4">
          {spotify ? (
            <a
              href={spotify.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-green-400/80 hover:text-green-300 transition-colors group"
            >
              <div className="flex gap-0.5 items-end h-3 w-3">
                <div className="w-1 bg-current animate-[bounce_1s_infinite_0.1s] h-1"></div>
                <div className="w-1 bg-current animate-[bounce_1s_infinite_0.3s] h-2"></div>
                <div className="w-1 bg-current animate-[bounce_1s_infinite_0.5s] h-1.5"></div>
              </div>
              <span className="max-w-30 md:max-w-50 truncate">
                Listening: {spotify.track} — {spotify.artist}
              </span>
            </a>
          ) : (
            <div className="flex items-center gap-2 opacity-40">
              <Music size={12} />
              <span>Music: Offline</span>
            </div>
          )}

          <div className="h-3 w-px bg-slate-800 hidden md:block"></div>

          {github && (
            <div className="hidden md:flex items-center gap-2 group cursor-default">
              <GitBranch
                size={12}
                className="group-hover:text-cyan-400 transition-colors"
              />
              <span>
                {github.repo} &gt; {github.message}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
