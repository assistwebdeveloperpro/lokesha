import {
  fetchAllProjectPages,
  fetchProjectsPage,
  type LimelightProjectsFilters,
} from "./limelightProjects.service";

const ICONIC_ENDPOINT = "/iconic-projects";

export const fetchAllIconicProjects = (filters?: LimelightProjectsFilters, signal?: AbortSignal) =>
  fetchAllProjectPages(ICONIC_ENDPOINT, filters, signal);

export const fetchIconicProjects = (
  query: { page: number; pageSize: number } & LimelightProjectsFilters,
  signal?: AbortSignal,
) => fetchProjectsPage(ICONIC_ENDPOINT, query, signal);
