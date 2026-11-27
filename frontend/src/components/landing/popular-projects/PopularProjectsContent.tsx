"use client";

import { Flame } from "lucide-react";
import { fetchPopularProjects } from "@/services/popularProjects.service";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import {
  LimelightProjectsContent,
  type ProjectsPageConfig,
} from "../limelight-projects/LimelightProjectsContent";

const POPULAR_PAGE: ProjectsPageConfig = {
  title: "Popular Projects",
  path: "/property/popular-projects",
  icon: Flame,
  fetchPage: fetchPopularProjects,
};

export function PopularProjectsContent({ filters }: { filters: LimelightProjectsFilters }) {
  return <LimelightProjectsContent filters={filters} page={POPULAR_PAGE} />;
}
