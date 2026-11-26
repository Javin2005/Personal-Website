export const API_URL = import.meta.env.VITE_API_URL as string;

export function getToken(): string | null {
    return localStorage.getItem("token");
}

function tokenExpired(token: string): boolean {
    try{
        const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload= JSON.parse(atob(part));
        return payload.exp * 1000 < Date.now();
    } catch{
        return true;
    }
}

export function isLoggedIn(): boolean {
    const token = getToken();
    return !!token && !tokenExpired(token);
}

export function logout(){
    localStorage.removeItem("token");
}

export async function authFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.headers as Record<string, string>),
            Authorization: `Bearer ${getToken()}`,
        },
    });
    if(res.status == 401) {
        logout();
        window.location.href = "/login";
    }
    return res;
}