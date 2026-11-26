import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../auth";

// Kept terminal-style on purpose: only I log in here.
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    // The backend's login endpoint expects form data, not JSON
    // (that's the OAuth2 standard FastAPI follows).
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_URL}/api/token`, { method: "POST", body: formData });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        navigate("/admin");
      } else if (response.status === 429) {
        setError("Too many attempts. Wait a minute.");
      } else {
        setError("Wrong username or password.");
      }
    } catch {
      setError("Can't reach the server. It may be waking up; try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5 font-mono text-sm">
      <div className="w-full max-w-md border border-text/15 bg-surface">
        <div className="flex items-center justify-between border-b border-text/15 px-5 py-3 text-xs text-muted">
          <span>login</span>
          <Link to="/" className="hover:text-accent">
            back to site
          </Link>
        </div>

        <form onSubmit={handleLogin} className="grid gap-5 p-5">
          <label className="grid gap-1">
            <span className="text-muted">
              <span className="text-accent">$</span> username
            </span>
            <input
              id="login-username"
              autoComplete="username"
              autoFocus
              className="field font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-muted">
              <span className="text-accent">$</span> password
            </span>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="field font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="text-accent">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 cursor-pointer border border-text/25 py-3 text-text transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-50"
          >
            {busy ? "signing in…" : "sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
