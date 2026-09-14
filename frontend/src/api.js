import { API_BASE_URL } from "./config";

async function jget(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function listManagers(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  return jget(`/api/managers?${qs.toString()}`);
}

export async function getManager(id) {
  return jget(`/api/managers/${id}`);
}

export async function compareManagers(ids) {
  return jget(`/api/compare?ids=${ids.join(",")}`);
}

export async function getOverlaps() {
  return jget(`/api/overlaps`);
}

export async function getActivity({ geography = "", firm = "" } = {}) {
  const qs = new URLSearchParams();
  if (geography) qs.set("geography", geography);
  if (firm) qs.set("firm", firm);
  return jget(`/api/activity?${qs.toString()}`);
}

export function exportUrl(id, kind) {
  return `${API_BASE_URL}/api/managers/${id}/export.${kind}`;
}
