import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProjectCard from "./components/ProjectCard";
import AboutSection from "./components/AboutSection";
import CreativeCard from "./components/CreativeCard";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import type { Project, About, CreativeItem } from "./types";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [creative, setCreative] = useState<CreativeItem[]>([]);

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

    fetch("http://localhost:8000/api/creative")
      .then((res) => res.json())
      .then((data) => setCreative(data))
      .catch((err) => console.error("Could not get creative data:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <section className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-4 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <source src="/assets/BlackHole_preview.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10">
          <h1
            className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400
            to-blue-600 mb-6 font-serif tracking-tighter"
          >
            Christian J Carlson
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light">
            Third year cs student at Lund | Fullstack developer | Graphics
            Enthusiast
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-slate-950 to-transparent"></div>
      </section>

      {about ? (
        <AboutSection about={about} />
      ) : (
        <div className="max-w-6xl mx-auto py-20 px-6 text-slate-500 italic">
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
      <section id="creative" className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-4">
          <span className="text-cyan-500 font-mono text-xl">03.</span>
          Creative Playground
          <div className="h-px bg-slate-800 grow"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creative.map((item) => (
            <CreativeCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
