export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_KEY = import.meta.env.VITE_API_KEY || "";

/** Merge the X-API-Key header when it's configured. */
export function authHeaders(extra = {}) {
  return API_KEY ? { ...extra, "X-API-Key": API_KEY } : extra;
}
