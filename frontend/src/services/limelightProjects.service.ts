import type {
  PublicSearchListing,
  PublicSearchListResponse,
} from "@/components/landing/property-search/property-list/publicSearchListing.types";
import type { LandingCategory } from "@/lib/property-search-url/landingUrl.config";
import { apiFetch, getAssetUrl } from "./apiClient";

export type LimelightProject = PublicSearchListing & {
  projectAreaAcres: number | null;
};

export type LimelightProjectsResponse = Omit<PublicSearchListResponse, "items"> & {
  items: LimelightProject[];
};

const ALL_PROJECTS_PAGE_SIZE = 50;

export type LimelightProjectsFilters = {
  listingType?: "sale" | "rent-lease";
  category?: LandingCategory;
  city?: string;
};

type ProjectsPageQuery = { page: number; pageSize: number } & LimelightProjectsFilters;

const LIMELIGHT_ENDPOINT = "/limelight-projects";

// Walks every page so the slider shows all the projects the admin selected
export async function fetchAllProjectPages(
  endpoint: string,
  filters: LimelightProjectsFilters = {},
  signal?: AbortSignal,
) {
  const first = await fetchProjectsPage(
    endpoint,
    { page: 1, pageSize: ALL_PROJECTS_PAGE_SIZE, ...filters },
    signal,
  );
  const pageCount = Math.ceil(first.total / first.pageSize);
  const rest = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      fetchProjectsPage(
        endpoint,
        { page: index + 2, pageSize: ALL_PROJECTS_PAGE_SIZE, ...filters },
        signal,
      ),
    ),
  );

  return [first, ...rest].flatMap(({ items }) => items);
}

export const fetchAllLimelightProjects = (filters?: LimelightProjectsFilters, signal?: AbortSignal) =>
  fetchAllProjectPages(LIMELIGHT_ENDPOINT, filters, signal);

export const fetchLimelightProjects = (query: ProjectsPageQuery, signal?: AbortSignal) =>
  fetchProjectsPage(LIMELIGHT_ENDPOINT, query, signal);

export async function fetchProjectsPage(
  endpoint: string,
  query: ProjectsPageQuery,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.listingType) params.set("listingType", query.listingType);
  if (query.category) params.set("category", query.category);
  if (query.city) params.set("city", query.city);

  const response = await apiFetch<LimelightProjectsResponse>(`${endpoint}?${params}`, {
    method: "GET",
    signal,
  });

  return {
    ...response,
    items: response.items.map((project) => ({
      ...project,
      imageUrl: project.imageUrl ? getAssetUrl(project.imageUrl) : null,
    })),
  };
}
