import { useState, useEffect } from "react";
import { GitBranch, Activity } from "lucide-react";

function StatusBar() {
  const [status, setStatus] = useState<{
    repo: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/status/github")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) setStatus(data);
      });
  }, []);

  return (
    <div className="w-full bg-cyan-500/10 border-b border-cyan-500/20 py-1.5 px-4 overflow-hidden">
      <div
        className="max-w-7xl mx-auto flex items-center justify-between
        font-mono text-[10px] uppercase tracking-widest text-cyan-500/80"
      >
        <div className="flex items-center gap-2">
          <Activity size={12} className="animate-pulse" />
          <span>
            System_status: <span className="text-cyan-400">Nominal</span>
          </span>
        </div>

        {status ? (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right duration-1000">
            <div className="flex items-center gap-1.5">
              <GitBranch size={12} />
              <span>Latest_commit:</span>
            </div>
            <span className="text-white bg-cyan-500/20 px-2 rounded">
              {status.repo} &gt; {status.message}
            </span>
          </div>
        ) : (
          <span>Initializing_Link...</span>
        )}

        <div className="hidden md:block">
          Lund_University // [55.7047° N, 13.1910° E]
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
