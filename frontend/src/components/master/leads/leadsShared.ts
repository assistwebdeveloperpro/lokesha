import type { DropdownOption } from "@/components/shared/CustomDropdown";
import { PROPERTY_DETAILS_BASE } from "@/lib/property-search-url/propertyDetailsUrl";
import { toUrlSegment } from "@/lib/property-search-url/slug";
import type { AdminLead, SentLeadResult } from "@/services/adminLeads.service";

export const LEADS_PATH = "/backend/leads";
export const LEAD_QUERY_PARAM = "lead";

export const LEADS_PAGE_SIZE = 10;

export const HIGHLIGHT_ROW_CLASS = "bg-sky-50 ring-2 ring-inset ring-sky-300";

type SearchParams = Record<string, string | string[] | undefined>;

export function getLeadsHref(leadId?: string | null): string {
  return leadId ? `${LEADS_PATH}?${LEAD_QUERY_PARAM}=${encodeURIComponent(leadId)}` : LEADS_PATH;
}

// A repeated query param is ignored, only a single id can be highlighted
export function getHighlightLeadId(searchParams: SearchParams): string | null {
  const value = searchParams[LEAD_QUERY_PARAM];
  return typeof value === "string" && value ? value : null;
}

export const LEAD_SEARCH_MIN_CHARS = 3;

export type LeadPhoneFilter = "all" | "shared" | "hidden";

export type LeadFilters = {
  search: string;
  phone: LeadPhoneFilter;
  verification: string;
  listedBy: string;
  propertyType: string;
  listingType: string;
};

export const DEFAULT_LEAD_FILTERS: LeadFilters = {
  search: "",
  phone: "all",
  verification: "all",
  listedBy: "all",
  propertyType: "all",
  listingType: "all",
};

export const LEAD_PHONE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All" },
  { value: "shared", label: "Lister phone shared" },
  { value: "hidden", label: "Lister phone hidden" },
];

export const LEAD_VERIFICATION_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "not_verified", label: "Not verified" },
];

export const LEAD_LISTED_BY_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All" },
  { value: "buyer_owner_tenant", label: "Owner" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
  { value: "lokesha_staff", label: "Lokesha Staff" },
  { value: "admin", label: "Admin" },
];

export const LEAD_PROPERTY_TYPE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "pg", label: "PG / Co-living" },
  { value: "plot", label: "Plot" },
  { value: "land", label: "Land" },
];

export const LEAD_LISTING_TYPE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All" },
  { value: "sale", label: "Sale" },
  { value: "rent-lease", label: "Rent / Lease" },
];

export const LISTED_BY_LABEL: Record<string, string> = {
  buyer_owner_tenant: "Owner",
  agent: "Agent",
  builder: "Builder",
  lokesha_staff: "Lokesha Staff",
  admin: "Admin",
};

export const LEAD_TABLE_COLUMNS = ["Lead", "Property", "Property Listed By", "Phone Status", "Date", "Status", "Lead Status", "View"] as const;

// Shared by header, rows and skeleton so the columns always line up
export const LEAD_GRID_CLASS =
  "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_44px] items-center gap-3";

// Keeps the desktop column widths, smaller screens scroll sideways instead of wrapping
export const LEAD_TABLE_MIN_WIDTH_CLASS = "min-w-[1400px]";

export const getPropertyDetailsHref = (propertyId: string, title: string) =>
  `${PROPERTY_DETAILS_BASE}/${toUrlSegment(title)}&id=${propertyId}`;

// Returns the list with the sent lead updated in place, other rows keep their reference
export function applySentLead(leads: AdminLead[], sent: SentLeadResult): AdminLead[] {
  return leads.map((lead) =>
    lead.id === sent.id ? { ...lead, distributionStatus: sent.distributionStatus, sentAt: sent.sentAt } : lead,
  );
}

export type LeadSendState = "not_verified" | "can_send" | "sent" | "no_account" | "limit_reached";

export const LEAD_LIMIT_REACHED_LABEL = "Free Limit Reached";

export const LEAD_LIMIT_REACHED_MESSAGE = "Lead limit reached. The lister must upgrade this property to receive more leads.";

// Decides what the Lead Status column shows for a lead
export function getLeadSendState(
  lead: Pick<AdminLead, "verificationStatus" | "distributionStatus" | "canSendToLister" | "leadLimitReached">,
): LeadSendState {
  if (lead.distributionStatus === "sent") return "sent";
  if (lead.verificationStatus !== "verified") return "not_verified";
  if (!lead.canSendToLister) return "no_account";
  return lead.leadLimitReached ? "limit_reached" : "can_send";
}

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
