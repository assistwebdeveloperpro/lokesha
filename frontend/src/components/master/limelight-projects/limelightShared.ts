import type { DropdownOption } from "@/components/shared/CustomDropdown";
import { formatBudgetOption } from "@/components/landing/property-search/search-filter-bar/budgetOptions";
import type { LimelightProjectSummary, LimelightSearchQuery } from "@/services/adminLimelightProjects.service";

export const LIMELIGHT_SEARCH_PAGE_SIZE = 12;
export const ADMIN_LOGIN_PATH = "/backend/login";

const LAC = 100_000;
const ALL = "all";

export type LimelightFilters = {
  keyword: string;
  city: string;
  locality: string;
  builder: string;
  bhk: string;
  priceMin: string;
  priceMax: string;
  possessionStatus: string;
  listedBy: string;
};

export const DEFAULT_LIMELIGHT_FILTERS: LimelightFilters = {
  keyword: "",
  city: "",
  locality: "",
  builder: "",
  bhk: ALL,
  priceMin: "",
  priceMax: "",
  possessionStatus: ALL,
  listedBy: ALL,
};

export const BHK_OPTIONS: DropdownOption[] = [
  { value: ALL, label: "All" },
  ...[1, 2, 3, 4, 5, 6].map((bhk) => ({ value: String(bhk), label: `${bhk} BHK` })),
];

export const POSSESSION_OPTIONS: DropdownOption[] = [
  { value: ALL, label: "All" },
  { value: "pre-launch", label: "Pre Launch" },
  { value: "under-construction", label: "Under Construction" },
  { value: "ready-to-move", label: "Ready to Move" },
];

export const LISTED_BY_OPTIONS: DropdownOption[] = [
  { value: ALL, label: "All" },
  { value: "builder", label: "Builder" },
  { value: "lokesha_staff", label: "Lokesha Staff" },
];

const toLacRupees = (value: string) => (value.trim() === "" ? undefined : String(Math.round(Number(value) * LAC)));
const emptyToUndefined = (value: string) => (value.trim() === "" ? undefined : value.trim());
const allToUndefined = (value: string) => (value === ALL ? undefined : value);

export function toSearchQuery(filters: LimelightFilters, page: number): LimelightSearchQuery {
  return {
    page,
    limit: LIMELIGHT_SEARCH_PAGE_SIZE,
    keyword: emptyToUndefined(filters.keyword),
    city: emptyToUndefined(filters.city),
    locality: emptyToUndefined(filters.locality),
    builder: emptyToUndefined(filters.builder),
    bhk: allToUndefined(filters.bhk),
    priceMin: toLacRupees(filters.priceMin),
    priceMax: toLacRupees(filters.priceMax),
    possessionStatus: allToUndefined(filters.possessionStatus),
    listedBy: allToUndefined(filters.listedBy),
  };
}

export function formatProjectLocation({ locality, city }: LimelightProjectSummary): string {
  return [locality, city].filter(Boolean).join(", ") || "Location not available";
}

export function formatProjectPrice({ priceMin, priceMax }: LimelightProjectSummary): string {
  if (priceMin === null) return "Price on request";
  if (priceMax !== null && priceMax !== priceMin) {
    return `${formatBudgetOption(priceMin, false)} - ${formatBudgetOption(priceMax, false)}`;
  }
  return formatBudgetOption(priceMin, false);
}

export function pluralizeProjects(count: number): string {
  return `${count} ${count === 1 ? "project" : "projects"}`;
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
