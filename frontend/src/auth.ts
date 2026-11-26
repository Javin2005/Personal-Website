// Everything that talks to the backend goes through these helpers.

export const API_URL = import.meta.env.VITE_API_URL as string;

export function getToken(): string | null {
  return localStorage.getItem("token");
}

// A JWT is three base64url pieces joined by dots: header.payload.signature.
// The payload holds "exp", the expiry time in seconds.
function tokenExpired(token: string): boolean {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(part));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  return !!token && !tokenExpired(token);
}

export function logout() {
  localStorage.removeItem("token");
}

// fetch() + the login token. Sends you to /login if the token is rejected.
export async function authFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) {
    logout();
    window.location.href = "/login";
  }
  return res;
}

// Send JSON with the login token and get JSON back, or throw a readable error.
export async function sendJson<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await authFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errorText(res));
  return res.json();
}

// FastAPI sends errors as {detail: "..."} or, for validation errors,
// {detail: [{loc: [...], msg: "..."}]}. Turn either into one line of text.
export async function errorText(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail))
    return body.detail
      .map((d: { loc: (string | number)[]; msg: string }) => `${d.loc.slice(1).join(".")}: ${d.msg}`)
      .join("; ");
  return `Request failed (${res.status})`;
}

// Upload an image or video; returns its URL on Cloudinary.
export async function uploadMedia(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await authFetch("/api/media", { method: "POST", body: form });
  if (!res.ok) throw new Error(await errorText(res));
  return (await res.json()).url;
}
