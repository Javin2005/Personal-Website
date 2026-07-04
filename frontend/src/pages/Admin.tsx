import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileCode, Camera, Save, Trash2, Plus } from "lucide-react";
import type { About, Project, LifePost } from "../types";

function Admin() {
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "life">(
    "profile",
  );
  const API_URL = import.meta.env.VITE_API_URL;
  const [about, setAbout] = useState<About | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [lifePosts, setLifePosts] = useState<LifePost[]>([]);
  const [status, setStatus] = useState("");
  const [showProjForm, setShowProjForm] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    const res = await fetch(`${API_URL}/api/about`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(about),
    });
    if (res.ok) setStatus("Profile saved!");
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Delete project?")) return;
    const res = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProjects(projects.filter((p) => p.id !== id));
  };

  const handleDeleteLife = async (id: number) => {
    if (!confirm("Are you sure? This will delete the photo permanently."))
      return;
    try {
      const res = await fetch(`${API_URL}/api/life/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLifePosts(lifePosts.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    fetch(`${API_URL}/api/about`)
      .then((res) => res.json())
      .then(setAbout);
    fetch(`${API_URL}/api/projects`)
      .then((res) => res.json())
      .then(setProjects);
    fetch(`${API_URL}/api/life`)
      .then((res) => res.json())
      .then(setLifePosts);
  }, [token, navigate]);

  if (!about)
    return (
      <div className="pt-32 text-center text-cyan-500 font-mono">
        Initializing...
      </div>
    );

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto min-h-screen font-mono">
      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl ${activeTab === "profile" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50" : "text-slate-500"}`}
          >
            <User size={18} /> Profile
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl ${activeTab === "projects" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50" : "text-slate-500"}`}
          >
            <FileCode size={18} /> Projects
          </button>
          <button
            onClick={() => setActiveTab("life")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl ${activeTab === "life" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50" : "text-slate-500"}`}
          >
            <Camera size={18} /> Life Gallery
          </button>
        </aside>

        <main className="flex-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-8">
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateAbout} className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">
                Edit Identity
              </h3>
              <input
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white"
                value={about.name}
                onChange={(e) => setAbout({ ...about, name: e.target.value })}
                placeholder="Name"
              />
              <input
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white"
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                placeholder="Title"
              />
              <textarea
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white h-32"
                value={about.bio}
                onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                placeholder="Bio"
              />
              <button
                type="submit"
                className="bg-cyan-600 px-8 py-3 rounded-xl text-white font-bold flex items-center gap-2"
              >
                <Save size={18} /> Commit Changes
              </button>
              <p className="text-cyan-500 text-xs">{status}</p>
            </form>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  Project Management
                </h3>
                <button
                  onClick={() => setShowProjForm(true)}
                  className="flex items-center gap-2 text-cyan-400 text-sm hover:underline"
                >
                  <Plus size={16} /> New Project
                </button>
              </div>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl flex justify-between"
                >
                  <span className="text-slate-200">{p.title}</span>
                  <Trash2
                    size={16}
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDeleteProject(p.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "life" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lifePosts.map((post) => (
                <div
                  key={post.id}
                  className="relative group rounded-lg overflow-hidden border border-slate-800"
                >
                  <img
                    src={post.image_url}
                    className="aspect-square object-cover"
                  />
                  <button
                    onClick={() => handleDeleteLife(post.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showProjForm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg w-full">
            <h2 className="text-white font-bold mb-4">Add Project</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as any;
                const newP = {
                  title: form.title.value,
                  description: form.desc.value,
                  category: form.cat.value,
                  difficulty: parseInt(form.diff.value),
                  tech_stack: form.tech.value.split(","),
                  featured: true,
                };
                fetch(`${API_URL}/api/projects`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(newP),
                }).then(() => {
                  setShowProjForm(false);
                  window.location.reload();
                });
              }}
            >
              <input
                name="title"
                placeholder="Title"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <input
                name="desc"
                placeholder="Description"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <input
                name="cat"
                placeholder="Category"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <input
                name="diff"
                type="number"
                placeholder="Difficulty"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <input
                name="tech"
                placeholder="Tech (React,Python)"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 py-3 rounded-lg text-white font-bold"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjForm(false)}
                  className="flex-1 bg-slate-800 py-3 rounded-lg text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
