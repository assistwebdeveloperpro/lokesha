export const LEADS_PATH = "/user/leads";
export const LEAD_QUERY_PARAM = "lead";

export const LEADS_PAGE_SIZE = 10;

export const LEADS_TABLE_COLUMNS = [
  "Property Details",
  "Price & Area",
  "Enquirer Details",
  "Enquiry Date",
  "Enquiry Details",
  "Action",
] as const;

// Shared by header, rows and skeleton so the columns always line up
export const LEADS_GRID_CLASS =
  "grid grid-cols-[1.5fr_1.3fr_1.3fr_0.9fr_0.9fr_0.9fr] text-nowrap items-center gap-4";

export const LEADS_TABLE_MIN_WIDTH_CLASS = "min-w-[1200px]";

export const LEADS_EMPTY_STATE = {
  title: "No leads yet",
  description: "Verified enquiries on your properties will appear here once Lokesha shares them with you.",
};

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

// The phone in question is the lister's own, shared with the enquirer
export function getPhoneStatusLabel(phoneRevealed: boolean): string {
  return phoneRevealed ? "Your number shared" : "Your number hidden";
}
