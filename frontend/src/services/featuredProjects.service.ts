import {
  fetchAllProjectPages,
  fetchProjectsPage,
  type LimelightProjectsFilters,
} from "./limelightProjects.service";

const FEATURED_ENDPOINT = "/featured-projects";

export const fetchAllFeaturedProjects = (filters?: LimelightProjectsFilters, signal?: AbortSignal) =>
  fetchAllProjectPages(FEATURED_ENDPOINT, filters, signal);

export const fetchFeaturedProjects = (
  query: { page: number; pageSize: number } & LimelightProjectsFilters,
  signal?: AbortSignal,
) => fetchProjectsPage(FEATURED_ENDPOINT, query, signal);
