interface Project {
  id: number;
  title: string;
  description?: string;
  tech_stack: string[];
  github_url?: string;
  featured: boolean;
  category?: string;
  difficulty: number;
}

function ProjectCard({
  title,
  description,
  tech_stack,
  github_url,
  category,
  difficulty,
  featured,
}: Project) {
  return (
    <div
      className={`relative p-8 border-2 border-slate-500/30 bg-slate-800/40 rounded-2xl transition-all
     hover:border-cyan-500/50 hover:bg-slate-800/60 group`}
    >
      {featured && (
        <span
          className="absolute -top-3 -right-3 bg-cyan-600 text-white text-[10px] font-bold 
                px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-900/20"
        ></span>
      )}

      <div className="mb-4">
        <span className="flex justify-center text-cyan-500 font-mono font-bold text-xs uppercase tracking-widest">
          {category || "General Project"}
        </span>
        <h3 className="text-2xl font-bold text-slate-100 group-hover:text-cyan-400 transition-color">
          {title}
        </h3>
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        {description || "No description provided."}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tech_stack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 text-[11px] font-mono bg-slate-900/50 text-slate-300 border border-slate-700 rounded-md"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700/50">
        {github_url ? (
          <a
            href={github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-
                    3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 
                    1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-
                    .305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-
                    .322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 
                    3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 
                    5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 
                    0-6.627-5.373-12-12-12z"
              />
            </svg>
            Code
          </a>
        ) : (
          <span className="text-slate-600 text-xs italic">Private repo</span>
        )}

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter mr-1">
            Diff:
          </span>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-3 rounded-sm ${i < difficulty ? "bg-cyan-500" : "bg-slate-700"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
