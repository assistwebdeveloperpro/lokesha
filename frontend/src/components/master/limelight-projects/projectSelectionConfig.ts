import { Flame, Gem, Rocket, Sparkles, Star, type LucideIcon } from "lucide-react";
import {
  featuredProjectsApi,
  iconicProjectsApi,
  limelightProjectsApi,
  newlyLaunchedProjectsApi,
  popularProjectsApi,
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
  showLaunchPeriodFilter?: boolean;
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
  pageTitle: "Featured Projects",
  pageSubtitle:
    "Manage and organize residential projects featured on the homepage.",
  currentTitle: "Selected Featured Projects",
  icon: Star,
  showListedByFilter: true,
  api: featuredProjectsApi,
};

export const ICONIC_SELECTION: ProjectSelectionConfig = {
  name: "Iconic Projects",
  pageTitle: "Iconic Projects",
  pageSubtitle:
    "Manage and organize residential projects shown as iconic on the homepage.",
  currentTitle: "Selected Iconic Projects",
  icon: Gem,
  showListedByFilter: true,
  api: iconicProjectsApi,
};

export const POPULAR_SELECTION: ProjectSelectionConfig = {
  name: "Popular Projects",
  pageTitle: "Popular Projects",
  pageSubtitle:
    "Manage and organize residential projects shown as popular on the homepage.",
  currentTitle: "Selected Popular Projects",
  icon: Flame,
  showListedByFilter: true,
  api: popularProjectsApi,
};

export const NEWLY_LAUNCHED_SELECTION: ProjectSelectionConfig = {
  name: "Newly Launched Projects",
  pageTitle: "Newly Launched Projects",
  pageSubtitle:
    "Manage and organize residential projects shown as newly launched on the homepage.",
  currentTitle: "Selected Newly Launched Projects",
  icon: Rocket,
  showListedByFilter: true,
  showLaunchPeriodFilter: true,
  api: newlyLaunchedProjectsApi,
};
