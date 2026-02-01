import { request } from "./api";

export function listDepartments({ page = 1, limit = 10, search = "", type = "All" } = {}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);
  if (search) params.append("search", search);
  if (type) params.append("type", type);
  return request(`/api/admin/departments?${params.toString()}`, { method: "GET", cache: "no-store" });
}

export function getDepartment(id) {
  return request(`/api/admin/departments/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" }
  });
}

export function createDepartment(payload) {
  return request("/api/admin/departments", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store"
  });
}

export function updateDepartment(id, payload) {
  return request(`/api/admin/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    cache: "no-store"
  });
}

export function deleteDepartment(id) {
  return request(`/api/admin/departments/${id}`, {
    method: "DELETE",
    cache: "no-store"
  });
}
