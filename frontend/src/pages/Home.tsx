import { useState, useEffect } from "react";
import ProjectCard from "../components/ProjectCard";
import AboutSection from "../components/AboutSection";
import CreativeCard from "../components/CreativeCard";
import Contact from "../components/Contact";
import type { Project, About, CreativeItem } from "../types";

function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [creative, setCreative] = useState<CreativeItem[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/projects/featured`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => console.error("Could not get project:", err));

    fetch(`${API_URL}/api/about`)
      .then((res) => res.json())
      .then((data) => setAbout(data))
      .catch((err) => console.error("Could not About data:", err));

    fetch(`${API_URL}/api/creative`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCreative(data);
        } else {
          setCreative([]);
        }
      })
      .catch((err) => {
        console.error("Could not get creative data:", err);
        setCreative([]);
      });
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* 1. LOCKED BACKGROUND LAYER: Black Hole stays fixed when scrolling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-55"
        >
          <source src="/assets/BlackHole_preview.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/25 to-black/45" />
      </div>

      {/* 2. HERO LAYER: Transparent so the black hole is visible behind your name */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
        <div>
          <h1
            className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400
            via-blue-500 to-blue-600 mb-6 font-serif tracking-tighter animate-gradient"
          >
            Christian J Carlson
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light">
            Third year cs student at Lund
          </p>
        </div>
      </section>

      {/* 3. FOREGROUND SHEET: Slides up IN FRONT of the black hole as you scroll */}
      <div className="relative z-10 bg-slate-950/35 backdrop-blur-[2px] border-t border-white/10">
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
            Featured Project
            <div className="h-px bg-slate-800 grow"></div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.length > 0 ? (
              projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))
            ) : (
              <p className="text-slate-500 italic">loading projects...</p>
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
      </div>
    </div>
  );
}

export default Home;