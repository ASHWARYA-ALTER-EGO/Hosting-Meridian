import { API_BASE_URL, authHeaders } from "./config";

async function jget(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function jpost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function jput(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// --------- existing ---------
export async function listManagers(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  return jget(`/api/managers?${qs.toString()}`);
}
export async function getManager(id) { return jget(`/api/managers/${id}`); }
export async function compareManagers(ids) { return jget(`/api/compare?ids=${ids.join(",")}`); }
export async function getOverlaps() { return jget(`/api/overlaps`); }
export async function getActivity({ geography = "", firm = "" } = {}) {
  const qs = new URLSearchParams();
  if (geography) qs.set("geography", geography);
  if (firm) qs.set("firm", firm);
  return jget(`/api/activity?${qs.toString()}`);
}
export function exportUrl(id, kind) { return `${API_BASE_URL}/api/managers/${id}/export.${kind}`; }
export async function askProfile(id, question) { return jpost(`/api/managers/${id}/ask`, { question }); }
export async function listDeals(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  return jget(`/api/deals?${qs.toString()}`);
}

// --------- new (Tier 1 + Tier 2) ---------
export async function askGlobal(question) {
  return jpost(`/api/ask-global`, { question });
}
export async function getComparables(id, k = 3) {
  return jget(`/api/comparables/${id}?k=${k}`);
}
export async function compareDiff(ids) {
  return jpost(`/api/compare-diff`, { ids });
}
export async function getSignals(days = 90) {
  return jget(`/api/signals?days=${days}`);
}
export async function saveNote(id, note) {
  return jput(`/api/managers/${id}/note`, { note });
}
export async function firmTimeline(id) {
  return jget(`/api/firms/${id}/timeline`);
}
