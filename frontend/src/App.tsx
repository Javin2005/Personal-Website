import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProjectCard from "./components/ProjectCard";
import AboutSection from "./components/AboutSection";
import type { Project, About } from "./types";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<About | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => console.error("Could not get project:", err));

    fetch("http://localhost:8000/api/about")
      .then((res) => res.json())
      .then((data) => setAbout(data))
      .catch((err) => console.error("Could not About data:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 scroll-smooth">
      <Navbar />

      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h1
          className="text-6xl md:text-7xl font-extrabold text-transparent 
        bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600 mb-6 font-serif"
        >
          Christian J Carlson
        </h1>
        <p className="text-xl text-slate-400 mx-w-2xl">
          Third year cs student in Facutly of Engineering at Lund | Fullstack
          developer
        </p>
      </section>

      {about ? (
        <AboutSection about={about} />
      ) : (
        <div className="mx-w-6xl mx-auto py-20 px-6 text-slate-500 italic">
          loading profile...
        </div>
      )}

      <section id="projects" className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
          <span className="text-cyan-500 font-mono text-xl">02.</span>
          Project
          <div className="h-px bg-slate-800 grow"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))
          ) : (
            <p className="text-slate-500 italic"> loading projects...</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
