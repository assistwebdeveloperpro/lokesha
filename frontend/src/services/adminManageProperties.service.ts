import { apiFetch } from "./apiClient";
import type { PropertyListItem, PropertyStatus } from "./property.service";

export type ManageListedBy = { source: "admin" | "user"; role: string; name: string | null };

export type ManageOwner = { name: string; email: string | null; mobile: string };

export type ManageListItem = PropertyListItem & { listedBy: ManageListedBy; owner: ManageOwner };

export type ManageListQuery = {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  source?: "admin" | "user";
  projectName?: string;
  role?: string;
};

export type ManageListResponse = {
  items: ManageListItem[];
  page: number;
  limit: number;
  total: number;
};

const BASE_PATH = "/master/manage-properties";

export function getManageProperties(query: ManageListQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const search = params.toString();

  return apiFetch<ManageListResponse>(`${BASE_PATH}${search ? `?${search}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
