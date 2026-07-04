import { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { NavHashLink } from "react-router-hash-link";
import type { Project } from "../types";
import ProjectCard from "../components/ProjectCard";

function Archive() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then((res) => res.json())
      .then((data) => setAllProjects(data))
      .catch((err) => console.error("Could not fetch the projects", err));
  }, []);

  const filteredProjects = allProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tech_stack.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="mb-12">
        <NavHashLink
          to="/"
          className="text-cyan-500 flex items-center gap-2 mb-4 hover:underline"
        >
          <ArrowLeft size={16} />
        </NavHashLink>
        <h1
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text 
            bg-linear-to-r from-cyan-400 via-blue-500  to-blue-600 mb-4 font-serif tracking-tighter animate-gradient pb-2"
        >
          Project Archive
        </h1>
        <p className="text-slate-400">
          A complete list of things I've built, experimented with, or abondoned.
        </p>
      </div>

      <div className="relative mb-12">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name or technology (e.g. 'FastAPI')..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white
                    focus:outline-none focus:border-cyan-500 transition-colors"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          No projects found matching your search...
        </div>
      )}
    </div>
  );
}

export default Archive;
