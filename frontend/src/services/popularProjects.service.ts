import {
  fetchAllProjectPages,
  fetchProjectsPage,
  type LimelightProjectsFilters,
} from "./limelightProjects.service";

const POPULAR_ENDPOINT = "/popular-projects";

export const fetchAllPopularProjects = (filters?: LimelightProjectsFilters, signal?: AbortSignal) =>
  fetchAllProjectPages(POPULAR_ENDPOINT, filters, signal);

export const fetchPopularProjects = (
  query: { page: number; pageSize: number } & LimelightProjectsFilters,
  signal?: AbortSignal,
) => fetchProjectsPage(POPULAR_ENDPOINT, query, signal);
