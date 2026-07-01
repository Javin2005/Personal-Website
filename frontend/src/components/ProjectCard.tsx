import { GitGraph } from "lucide-react";

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
            <GitGraph size={20} strokeWidth={2} />
            <span>Code</span>
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
