import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {API_URL, authFetch, isLoggedIn } from "../auth";
import { User, FileCode, Camera, Save, Trash2, Plus } from "lucide-react";
import type { About, Project, LifePost } from "../types";

function Admin() {
  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "life">(
    "profile",
  );
  const [about, setAbout] = useState<About | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [lifePosts, setLifePosts] = useState<LifePost[]>([]);
  const [status, setStatus] = useState("");
  const [showProjForm, setShowProjForm] = useState(false);

  const navigate = useNavigate();

  // FastAPI sends errors as {detail: "..."} or, for validation errors,
  // {detail: [{loc: [...], msg: "..."}]}. Turn either into readable text.
  const errorText = async (res: Response) => {
    const body = await res.json().catch(() => null);
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail))
      return body.detail
        .map((d: { loc: string[]; msg: string }) => `${d.loc.at(-1)}: ${d.msg}`)
        .join(", ");
    return `Request failed (${res.status})`;
  };


  const handleUpdateAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;
    const res = await authFetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(about),
    });
    setStatus(res.ok ? "Profile saved!" : `Error: ${await errorText(res)}`);
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Delete project?")) return;
    const res = await authFetch(`/api/projects/${id}`, {
      method: "DELETE"
    });
    if (res.ok) setProjects(projects.filter((p) => p.id !== id));
    else alert(`Delete failed: ${await errorText(res)}`);
  };

  const handleDeleteLife = async (id: number) => {
    if (!confirm("Are you sure? This will delete the photo permanently."))
      return;
    try {
      const res = await authFetch(`/api/life/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setLifePosts(lifePosts.filter((p) => p.id !== id));
      } else {
        alert(`Delete failed: ${await errorText(res)}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    if(!isLoggedIn()){
      navigate("/login");
      return;
    }
    fetch(`${API_URL}/api/about`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(setAbout)
      .catch(() => setStatus("Could not load profile from the server"));
    fetch(`${API_URL}/api/projects`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => {});
    fetch(`${API_URL}/api/life`)
      .then((res) => res.json())
      .then(setLifePosts)
      .catch(() => {});
  }, [navigate]);

  if (!about)
    return (
      <div className="pt-32 text-center text-cyan-500 font-mono">
        {status || "Initializing..."}
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
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const text = (key: string) => String(form.get(key) ?? "").trim();
                const newP = {
                  title: text("title"),
                  description: text("desc"),
                  category: text("cat") || "General",
                  difficulty: Number(text("diff")) || 1,
                  tech_stack: text("tech")
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                  github_url: text("github") || null,
                  featured: form.get("featured") === "on",
                };
                const res = await authFetch("/api/projects", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newP),
                });
                if (res.ok) {
                  const created: Project = await res.json();
                  setProjects([...projects, created]);
                  setShowProjForm(false);
                  setStatus("");
                } else {
                  setStatus(`Error: ${await errorText(res)}`);
                }
              }}
            >
              <input
                name="title"
                required
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
                min={1}
                max={5}
                defaultValue={3}
                placeholder="Difficulty (1-5)"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <input
                name="tech"
                placeholder="Tech (React, Python)"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <input
                name="github"
                type="url"
                placeholder="GitHub URL (optional)"
                className="w-full bg-slate-950 p-3 rounded-lg text-white"
              />
              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input name="featured" type="checkbox" /> Show on homepage
              </label>
              {status.startsWith("Error") && (
                <p className="text-red-400 text-xs">{status}</p>
              )}
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
