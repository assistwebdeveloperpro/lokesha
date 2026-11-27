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

// One client per selection section, since Limelight and Featured share the same admin endpoints
function createProjectSelectionApi(basePath: string) {
  return {
    async search(query: LimelightSearchQuery, token: string) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.set(key, String(value));
      });

      const response = await apiFetch<LimelightSearchResponse>(`${basePath}/search?${params}`, {
        method: "GET",
        headers: authHeaders(token),
      });

      return { ...response, items: response.items.map(withImage) };
    },

    async fetchEntries(token: string) {
      const response = await apiFetch<LimelightEntriesResponse>(basePath, {
        method: "GET",
        headers: authHeaders(token),
      });

      return { ...response, items: response.items.map(withImage) };
    },

    addProjects(projectIds: string[], token: string) {
      return apiFetch<AddLimelightResult>(basePath, {
        method: "POST",
        headers: authHeaders(token),
        body: { projectIds },
      });
    },

    removeProject(projectId: string, token: string) {
      return apiFetch<null>(`${basePath}/${projectId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
    },

    saveOrder(projectIds: string[], token: string) {
      return apiFetch<null>(`${basePath}/order`, {
        method: "PUT",
        headers: authHeaders(token),
        body: { projectIds },
      });
    },
  };
}

export type ProjectSelectionApi = ReturnType<typeof createProjectSelectionApi>;

export const limelightProjectsApi = createProjectSelectionApi("/master/limelight-projects");
export const featuredProjectsApi = createProjectSelectionApi("/master/featured-projects");
export const iconicProjectsApi = createProjectSelectionApi("/master/iconic-projects");
