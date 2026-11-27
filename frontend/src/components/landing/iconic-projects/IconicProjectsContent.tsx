"use client";

import { Gem } from "lucide-react";
import { fetchIconicProjects } from "@/services/iconicProjects.service";
import type { LimelightProjectsFilters } from "@/services/limelightProjects.service";
import {
  LimelightProjectsContent,
  type ProjectsPageConfig,
} from "../limelight-projects/LimelightProjectsContent";

const ICONIC_PAGE: ProjectsPageConfig = {
  title: "Iconic Projects",
  path: "/property/iconic-projects",
  icon: Gem,
  fetchPage: fetchIconicProjects,
};

export function IconicProjectsContent({ filters }: { filters: LimelightProjectsFilters }) {
  return <LimelightProjectsContent filters={filters} page={ICONIC_PAGE} />;
}
