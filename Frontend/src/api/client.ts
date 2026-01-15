export const API_BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/+$/g, "");

function buildUrl(path: string) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path));

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed: ${text}`);
  }

  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed: ${text}`);
  }

  return res.json();
}
