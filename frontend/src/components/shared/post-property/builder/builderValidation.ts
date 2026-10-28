import type { PricingOthersValues } from "../config/postPropertyForm.shared";
import type { ProjectDetailsValues } from "@/components/master/post-property/postPropertyProjectDetails";
import type { BuilderConfig } from "./builderConfig";

export type BuilderFieldErrors = Partial<
  Record<"projectType" | "assuredReturn" | "bhkAreas", string>
>;

export function validateBuilderProjectType(
  project: ProjectDetailsValues,
  config: BuilderConfig,
): BuilderFieldErrors {
  if (config.showProjectType && !project.projectType) {
    return { projectType: "Please select project type" };
  }
  return {};
}

export function validateBuilderPricing(
  pricing: PricingOthersValues,
  config: BuilderConfig,
): BuilderFieldErrors {
  if (!config.showAssuredReturn || !pricing.assuredReturn.trim()) {
    return {};
  }

  const percent = Number(pricing.assuredReturn);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return { assuredReturn: "Assured return must be between 0 and 100" };
  }
  return {};
}
