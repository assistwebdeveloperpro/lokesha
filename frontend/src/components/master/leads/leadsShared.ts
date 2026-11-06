import type { DropdownOption } from "@/components/shared/CustomDropdown";
import type { PropertyContactRole } from "@/services/propertyContact.service";

export const LEADS_PAGE_SIZE = 10;

export type LeadRoleFilter = PropertyContactRole | "all";
export type LeadPhoneFilter = "all" | "shared" | "hidden";

export type LeadFilters = {
  search: string;
  role: LeadRoleFilter;
  phone: LeadPhoneFilter;
};

export const DEFAULT_LEAD_FILTERS: LeadFilters = { search: "", role: "all", phone: "all" };

export const LEAD_ROLE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owner" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
];

export const LEAD_PHONE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All" },
  { value: "shared", label: "Phone shared" },
  { value: "hidden", label: "Phone hidden" },
];

export const CONTACT_ROLE_LABEL: Record<PropertyContactRole, string> = {
  owner: "Owner",
  agent: "Agent",
  builder: "Builder",
};

export const LISTED_BY_LABEL: Record<string, string> = {
  buyer_owner_tenant: "Owner",
  agent: "Agent",
  builder: "Builder",
  lokesha_staff: "Lokesha Staff",
  admin: "Admin",
};

export const LEAD_TABLE_COLUMNS = ["Lead", "Property", "Property Listed By", "Enquiry", "Date", "Status"] as const;

// Shared by header, rows and skeleton so the columns always line up
export const LEAD_GRID_CLASS = "grid grid-cols-[1.2fr_1.3fr_1.2fr_1fr_0.9fr_0.8fr] items-center gap-4";

export const LEAD_TABLE_MIN_WIDTH_CLASS = "min-w-[1100px]";

export function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const TIME_FORMAT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < MINUTE_MS) return "Just now";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}m ago`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}h ago`;
  if (diff < 7 * DAY_MS) return `${Math.floor(diff / DAY_MS)}d ago`;
  return DATE_FORMAT.format(new Date(iso));
}

export function formatAbsoluteTime(iso: string): string {
  const date = new Date(iso);
  return `${DATE_FORMAT.format(date)}, ${TIME_FORMAT.format(date)}`;
}
