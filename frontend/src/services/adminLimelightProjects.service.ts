import { apiFetch, getAssetUrl } from "./apiClient";
import type { PropertyDetailsSource } from "@/lib/property-search-url/propertyDetailsUrl";

export type LimelightProjectSummary = {
  projectId: string;
  projectName: string;
  builderName: string | null;
  locality: string | null;
  city: string | null;
  priceMin: number | null;
  priceMax: number | null;
  mainImage: string | null;
};

export type LimelightSearchResult = LimelightProjectSummary & {
  listingNumber: number;
  detailsSource: PropertyDetailsSource | null;
  alreadyAdded: boolean;
};

export type LimelightEntry = LimelightProjectSummary & {
  position: number;
  isVisible: boolean;
};

export type LimelightSearchQuery = {
  page: number;
  limit: number;
  keyword?: string;
  city?: string;
  locality?: string;
  builder?: string;
  propertyType?: string;
  bhk?: string;
  priceMin?: string;
  priceMax?: string;
  possessionStatus?: string;
  listedBy?: string;
};

export type LimelightSearchResponse = {
  items: LimelightSearchResult[];
  page: number;
  limit: number;
  total: number;
};

export type LimelightEntriesResponse = {
  items: LimelightEntry[];
  total: number;
};

export type AddLimelightResult = { added: number; skipped: number };

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

const withImage = <T extends LimelightProjectSummary>(project: T): T => ({
  ...project,
  mainImage: project.mainImage ? getAssetUrl(project.mainImage) : null,
});

export async function searchLimelightProjects(query: LimelightSearchQuery, token: string) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });

  const response = await apiFetch<LimelightSearchResponse>(
    `/master/limelight-projects/search?${params}`,
    { method: "GET", headers: authHeaders(token) },
  );

  return { ...response, items: response.items.map(withImage) };
}

export async function fetchLimelightEntries(token: string) {
  const response = await apiFetch<LimelightEntriesResponse>("/master/limelight-projects", {
    method: "GET",
    headers: authHeaders(token),
  });

  return { ...response, items: response.items.map(withImage) };
}

export function addLimelightProjects(projectIds: string[], token: string) {
  return apiFetch<AddLimelightResult>("/master/limelight-projects", {
    method: "POST",
    headers: authHeaders(token),
    body: { projectIds },
  });
}

export function removeLimelightProject(projectId: string, token: string) {
  return apiFetch<null>(`/master/limelight-projects/${projectId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function saveLimelightOrder(projectIds: string[], token: string) {
  return apiFetch<null>("/master/limelight-projects/order", {
    method: "PUT",
    headers: authHeaders(token),
    body: { projectIds },
  });
}
