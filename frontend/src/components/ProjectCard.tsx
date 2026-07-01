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

export default function ProjectCard({
  tile,
  description,
  tech_stack,
  github_url,
  difficulty,
}: Project) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700"></div>
  );
}
