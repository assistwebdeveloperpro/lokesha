"use client";

import { Rocket } from "lucide-react";
import { fetchNewlyLaunchedProjects } from "@/services/newlyLaunchedProjects.service";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import {
  LimelightProjectsContent,
  type ProjectsPageConfig,
} from "../limelight-projects/LimelightProjectsContent";

const NEWLY_LAUNCHED_PAGE: ProjectsPageConfig = {
  title: "Newly Launched Projects",
  path: "/property/newly-launched-projects",
  icon: Rocket,
  fetchPage: fetchNewlyLaunchedProjects,
};

export function NewlyLaunchedProjectsContent({ filters }: { filters: LimelightProjectsFilters }) {
  return <LimelightProjectsContent filters={filters} page={NEWLY_LAUNCHED_PAGE} />;
}
