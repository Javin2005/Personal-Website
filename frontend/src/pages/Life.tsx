import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import type { LifePost } from "../types";

export default function Life() {
  const [posts, setPosts] = useState<LifePost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    caption: "",
    category: "General",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isLoggedIn = !!localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleAddPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select an image");
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("caption", newPost.caption);
    formData.append("category", newPost.category);
    formData.append("image", selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/life`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const savedPost = await res.json();
        setPosts([savedPost, ...posts]);
        setShowForm(false);
        setNewPost({ title: "", caption: "", category: "General" });
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/life`)
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6
        bg-black/80 backdrop-blur-sm"
        >
          <div
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl
          max-w-md w-full relative"
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute
            top-4 right-4 text-slate-500 hover:text-white"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">
              {" "}
              Add to Gallery
            </h2>

            <form onSubmit={handleAddPost} className="space-y-4">
              <input
                placeholder="Title"
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl
                text-white outline-none focus:border-cyan-500"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                required
              />

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono pl-1">
                  Upload_Disk_Resource
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />

                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-3 w-full bg-slate-950 border-2 border-dashed border-slate-800 p-6 rounded-xl text-slate-400 cursor-pointer hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                  >
                    <span className="text-sm font-mono italic">
                      {selectedFile
                        ? `SELECTED: ${selectedFile.name}`
                        : "SELECT_IMAGE_FILE"}
                    </span>
                  </label>
                </div>
              </div>

              <textarea
                placeholder="Caption"
                className="w-full bg-slate-950 border border-slate-800 p-3
                    rounded-xl text-white outline-none focus:border-cyan-500 h-24 resize-none"
                value={newPost.caption}
                onChange={(e) =>
                  setNewPost({ ...newPost, caption: e.target.value })
                }
                required
              />
              <button
                type="submit"
                className="w-full py-4 bg-cyan-600
                  text-white font-bold rounded-xl hover:bg-cyan-500 transition-all"
              >
                Upload to Life
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-bold text-white mb-4">Life Gallery</h1>
          <p className="text-slate-500 font-mono">
            Behind the code: food, fitness, and exploration.
          </p>
        </div>

        {isLoggedIn && (
          <button
            onClick={() => setShowForm(true)}
            className="p-4 bg-cyan-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-cyan-900/40"
          >
            <Plus />
          </button>
        )}
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={`relative break-inside-avoid rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group transition-all hover:border-cyan-500/50
              ${index % 3 === 0 ? "aspect-square" : "aspect-3/4"}`}
          >
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-2">
                {post.category}
              </span>
              <h3 className="text-xl font-bold text-white mb-1">
                {post.title}
              </h3>
              <p className="text-slate-400 text-sm">{post.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
