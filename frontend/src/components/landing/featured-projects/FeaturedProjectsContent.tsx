"use client";

import { Star } from "lucide-react";
import { fetchFeaturedProjects } from "@/services/featuredProjects.service";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import {
  LimelightProjectsContent,
  type ProjectsPageConfig,
} from "../limelight-projects/LimelightProjectsContent";

const FEATURED_PAGE: ProjectsPageConfig = {
  title: "Featured Projects",
  path: "/property/featured-projects",
  icon: Star,
  fetchPage: fetchFeaturedProjects,
};

export function FeaturedProjectsContent({ filters }: { filters: LimelightProjectsFilters }) {
  return <LimelightProjectsContent filters={filters} page={FEATURED_PAGE} />;
}
