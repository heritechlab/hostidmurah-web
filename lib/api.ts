import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hostidmurah.web.id/api";

// Origin (tanpa "/api") untuk membangun URL absolut ke file statis (mis. /uploads/...),
// karena admin panel jalan di subdomain terpisah (admin.hostidmurah.web.id) sehingga
// path relatif "/uploads/..." tidak bisa dipakai langsung di sana.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401 → clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
