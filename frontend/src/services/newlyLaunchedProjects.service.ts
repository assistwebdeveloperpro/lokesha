import {
  fetchAllProjectPages,
  fetchProjectsPage,
  type LimelightProjectsFilters,
} from "./limelightProjects.service";

const NEWLY_LAUNCHED_ENDPOINT = "/newly-launched-projects";

export const fetchAllNewlyLaunchedProjects = (filters?: LimelightProjectsFilters, signal?: AbortSignal) =>
  fetchAllProjectPages(NEWLY_LAUNCHED_ENDPOINT, filters, signal);

export const fetchNewlyLaunchedProjects = (
  query: { page: number; pageSize: number } & LimelightProjectsFilters,
  signal?: AbortSignal,
) => fetchProjectsPage(NEWLY_LAUNCHED_ENDPOINT, query, signal);
