import { formatSearchListingArea } from "@/components/landing/property-search/property-list/formatSearchListingArea";
import { formatSearchListingPrice } from "@/components/landing/property-search/property-list/buildSearchListingFacts";
import { buildPropertyDetailsUrl } from "@/lib/property-search-url/propertyDetailsUrl";
import type { LimelightProject } from "@/services/limelightProjects.service";

const EMPTY_VALUE = "—";

export type LimelightCardDetail = { label: string; value: string };

export function formatLimelightLocation({ locality, city }: LimelightProject): string {
  return [locality, city].filter(Boolean).join(", ");
}

function formatProjectSize({ totalUnits }: LimelightProject): string {
  if (totalUnits === null) return EMPTY_VALUE;
  return `${totalUnits.toLocaleString("en-IN")} ${totalUnits === 1 ? "Unit" : "Units"}`;
}

function formatProjectArea({ projectAreaAcres }: LimelightProject): string {
  if (projectAreaAcres === null) return EMPTY_VALUE;
  return `${projectAreaAcres.toLocaleString("en-IN")} ${projectAreaAcres === 1 ? "Acre" : "Acres"}`;
}

export function buildLimelightDetails(project: LimelightProject): LimelightCardDetail[] {
  return [
    { label: "Configuration", value: project.categoryLabel || EMPTY_VALUE },
    { label: "Project Size", value: formatProjectSize(project) },
    { label: "Size", value: formatSearchListingArea(project) },
    { label: "Project Area", value: formatProjectArea(project) },
  ];
}

export const formatLimelightPrice = formatSearchListingPrice;

export function buildLimelightDetailsHref(project: LimelightProject): string {
  return buildPropertyDetailsUrl({
    id: project.id,
    bedrooms: project.bedrooms,
    carpetArea: project.carpetAreaMin,
    carpetAreaUnit: project.carpetAreaUnit,
    propertySubType: project.propertySubType,
    propertyType: project.propertyType,
    listingType: project.listingType,
    locality: project.locality,
    city: project.city,
  });
}
