import type { PropertySearchMoreFilters } from "./moreFilters.types";
import { EMPTY_MORE_FILTERS } from "./moreFilters.types";

const splitList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (values: string[]) =>
  values.length > 0 ? values.map(encodeURIComponent).join(",") : undefined;

const readFlag = (value: string | undefined) => value === "1" || value === "true";

const writeFlag = (value: boolean | undefined) =>
  value ? "1" : undefined;

export type MoreFilterListKey = {
  [K in keyof PropertySearchMoreFilters]-?: PropertySearchMoreFilters[K] extends string[]
    ? K
    : never;
}[keyof PropertySearchMoreFilters];

export type MoreFilterFlagKey =
  | "hasRera"
  | "hasPhotos"
  | "hasVideos"
  | "boundaryWallMade"
  | "cornerPlot"
  | "anyConstruction"
  | "carParkingAvailable"
  | "clubMembership"
  | "priceNegotiable"
  | "pantry"
  | "cafeteria"
  | "cornerShop";

export const POSTED_SINCE_PARAM = "posted-since";
export const AVAILABLE_FROM_PARAM = "available-from";

export const MORE_FILTER_LIST_PARAMS: Record<MoreFilterListKey, string> = {
  balconies: "balcony",
  bathroomCounts: "bathroom-count",
  ageOfConstruction: "age-of-construction",
  lifts: "lift",
  cabins: "cabin",
  totalFloors: "total-floor",
  floorNumbers: "floor-number",
  floorsAllowed: "floors-allowed",
  furnishingStatuses: "furnishing-status",
  furnishingItems: "furnishing-item",
  amenities: "amenity",
  facings: "facing",
  washrooms: "washroom",
  roadFacings: "road-facing",
  businessTypes: "business-type",
  tenantPreferences: "tenant-preference",
  pgRules: "pg-rule",
  foods: "food",
  openSides: "open-sides",
  carParkings: "car-parking",
  priceInclusion: "price-inclusion",
  managedBy: "managed-by",
  penthouseTypes: "penthouse-type",
  terraceEntries: "terrace-entry",
  pgGenders: "pg-gender",
  pgOperationSince: "pg-operation-since",
  pgPresentIn: "pg-present-in",
  entryTill: "entry-till",
};

export const MORE_FILTER_FLAG_PARAMS: Record<MoreFilterFlagKey, string> = {
  hasRera: "has-rera",
  hasPhotos: "has-photos",
  hasVideos: "has-videos",
  boundaryWallMade: "boundary-wall",
  cornerPlot: "corner-plot",
  anyConstruction: "any-construction",
  carParkingAvailable: "car-parking-available",
  clubMembership: "club-membership",
  priceNegotiable: "price-negotiable",
  pantry: "pantry",
  cafeteria: "cafeteria",
  cornerShop: "corner-shop",
};

export const MORE_FILTER_PARAM_KEYS = [
  POSTED_SINCE_PARAM,
  AVAILABLE_FROM_PARAM,
  ...Object.values(MORE_FILTER_LIST_PARAMS),
  ...Object.values(MORE_FILTER_FLAG_PARAMS),
] as const;

export type MoreFilterParamKey = (typeof MORE_FILTER_PARAM_KEYS)[number];

const LIST_PARAM_TO_KEY = Object.fromEntries(
  Object.entries(MORE_FILTER_LIST_PARAMS).map(([key, param]) => [param, key]),
) as Record<string, MoreFilterListKey>;

const FLAG_PARAM_TO_KEY = Object.fromEntries(
  Object.entries(MORE_FILTER_FLAG_PARAMS).map(([key, param]) => [param, key]),
) as Record<string, MoreFilterFlagKey>;

export function parseMoreFiltersFromParams(
  params: Record<string, string | undefined>,
): PropertySearchMoreFilters {
  const more: PropertySearchMoreFilters = { ...EMPTY_MORE_FILTERS };

  more.postedSince = params[POSTED_SINCE_PARAM] ?? "";
  more.availableFrom = params[AVAILABLE_FROM_PARAM] ?? "";

  for (const [param, rawKey] of Object.entries(LIST_PARAM_TO_KEY)) {
    more[rawKey] = splitList(params[param]);
  }

  for (const [param, rawKey] of Object.entries(FLAG_PARAM_TO_KEY)) {
    const value = readFlag(params[param]);
    if (value) more[rawKey] = true;
  }

  return more;
}

export function formatMoreFiltersToParams(
  more: PropertySearchMoreFilters,
): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};

  params[POSTED_SINCE_PARAM] = more.postedSince || undefined;
  params[AVAILABLE_FROM_PARAM] = more.availableFrom || undefined;

  for (const [key, param] of Object.entries(MORE_FILTER_LIST_PARAMS) as [
    MoreFilterListKey,
    string,
  ][]) {
    params[param] = joinList(more[key]);
  }

  for (const [key, param] of Object.entries(MORE_FILTER_FLAG_PARAMS) as [
    MoreFilterFlagKey,
    string,
  ][]) {
    params[param] = writeFlag(more[key]);
  }

  return params;
}

export function countMoreFilterSelections(more: PropertySearchMoreFilters): number {
  let count = 0;
  if (more.postedSince) count += 1;
  if (more.availableFrom) count += 1;
  for (const key of Object.keys(MORE_FILTER_LIST_PARAMS) as MoreFilterListKey[]) {
    count += more[key].length;
  }
  for (const key of Object.keys(MORE_FILTER_FLAG_PARAMS) as MoreFilterFlagKey[]) {
    if (more[key]) count += 1;
  }
  return count;
}
