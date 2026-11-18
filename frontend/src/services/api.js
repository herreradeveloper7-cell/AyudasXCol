const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiFetch(ruta, token, options = {}) {
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${ruta}`, {
    ...options,
    headers,
  });
}
