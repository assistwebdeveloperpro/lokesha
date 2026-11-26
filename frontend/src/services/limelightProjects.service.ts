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

// Walks every page so the slider shows all the projects the admin selected
export async function fetchAllLimelightProjects(
  filters: LimelightProjectsFilters = {},
  signal?: AbortSignal,
) {
  const first = await fetchLimelightProjects(
    { page: 1, pageSize: ALL_PROJECTS_PAGE_SIZE, ...filters },
    signal,
  );
  const pageCount = Math.ceil(first.total / first.pageSize);
  const rest = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      fetchLimelightProjects(
        { page: index + 2, pageSize: ALL_PROJECTS_PAGE_SIZE, ...filters },
        signal,
      ),
    ),
  );

  return [first, ...rest].flatMap(({ items }) => items);
}

export async function fetchLimelightProjects(
  query: { page: number; pageSize: number } & LimelightProjectsFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.listingType) params.set("listingType", query.listingType);
  if (query.category) params.set("category", query.category);
  if (query.city) params.set("city", query.city);

  const response = await apiFetch<LimelightProjectsResponse>(`/limelight-projects?${params}`, {
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
