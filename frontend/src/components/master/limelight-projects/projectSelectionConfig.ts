import { Sparkles, Star, type LucideIcon } from "lucide-react";
import {
  featuredProjectsApi,
  limelightProjectsApi,
  type ProjectSelectionApi,
} from "@/services/adminLimelightProjects.service";

// Everything that differs between the admin screens that pick landing page projects
export type ProjectSelectionConfig = {
  name: string;
  pageTitle: string;
  pageSubtitle: string;
  currentTitle: string;
  icon: LucideIcon;
  showListedByFilter: boolean;
  api: ProjectSelectionApi;
};

export const LIMELIGHT_SELECTION: ProjectSelectionConfig = {
  name: "Limelight",
  pageTitle: "Limelight Projects",
  pageSubtitle: "Choose the projects featured on the landing page",
  currentTitle: "Currently In Limelight",
  icon: Sparkles,
  showListedByFilter: false,
  api: limelightProjectsApi,
};

export const FEATURED_SELECTION: ProjectSelectionConfig = {
  name: "Featured Projects",
  pageTitle: "Featured Projects Management",
  pageSubtitle:
    "Manage and organize residential projects displayed in the Featured Projects section on the homepage.",
  currentTitle: "Selected Featured Projects",
  icon: Star,
  showListedByFilter: true,
  api: featuredProjectsApi,
};
