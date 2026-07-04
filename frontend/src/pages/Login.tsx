import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_URL}/api/token`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        navigate("/");
      } else {
        setError("ACCESS DENIED: INVALID CREDENTIALS");
      }
    } catch (err) {
      setError("SYSTEM ERROR: UNABLE TO REACH HOST");
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center
    p-6 font-mono crt-overlay overflow-hidden relative"
    >
      <div className="scanline"></div>

      <div
        className="max-w-md w-full border-2 border-cyan-500/50 p-8 bg-slate-900/20
      backdrop-blur-sm relative z-10"
      >
        <div
          className="flex items-center gap-3 mb-8 border-b-2 
        border-cyan-500/50 pb-4"
        >
          <Terminal className="text-cyan-400 animate-pulse" />
          <h1 className="text-cyan-400 text-xl tracking-[0.2em] uppercase">
            Admin_Auth_System
          </h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-cyan-700 text-xs uppercase tracking-widest">
              User_Identification
            </label>
            <input
              type="text"
              className="w-full bg-black border border-cyan-900/50 p-3 
              text-cyan-400 focus:outline-none focus:border-cyan-400 transition-all
              placeholder:text-cyan-900"
              placeholder="root@admin..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-cyan-700 text-xs uppercase tracking-widest">
              Secret_Passkey
            </label>
            <input
              type="password"
              className="w-full bg-black border border-cyan-900/50 p-3
              text-cyan-400 focus:outline-none focus:border-cyan-400 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold animate-flicker">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-cyan-900/20 border border-cyan-500/50
            text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold
            transition-all uppercase tracking-[0.3em] text-sm"
          >
            Execute_Login
          </button>
        </form>

        <div className="mt-8 text-[10px] text-cyan-900 uppercase tracking-widest text-center">
          Terminal Status: Ready
        </div>
      </div>
    </div>
  );
}
export default Login;
