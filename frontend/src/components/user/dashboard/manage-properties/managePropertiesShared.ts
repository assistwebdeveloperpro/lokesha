import type { PropertyListItem, PropertyStatus } from "@/services/property.service";

export const PAGE_SIZE = 12;

export type ManageListStatus = Extract<
  PropertyStatus,
  "draft" | "pending" | "published" | "rejected" | "closed"
>;

export type ManageListFilter = ManageListStatus | "all";

export const MANAGE_TABS: { status: ManageListFilter; label: string }[] = [
  { status: "all", label: "All" },
  { status: "draft", label: "Draft" },
  { status: "pending", label: "In review" },
  { status: "published", label: "Published" },
  { status: "rejected", label: "Rejected" },
  { status: "closed", label: "Closed" },
];

export const MANAGE_EMPTY_STATES: Record<
  ManageListFilter,
  { title: string; description: string; showPostCta: boolean }
> = {
  all: {
    title: "No properties yet",
    description: "Start a new post to add your first property. Every listing you create will show up here.",
    showPostCta: true,
  },
  draft: {
    title: "No draft properties",
    description: "Save a listing as a draft or start a new post. Drafts stay private until you submit them.",
    showPostCta: true,
  },
  pending: {
    title: "Nothing in review",
    description: "Properties you submit for review will appear here while our team checks them.",
    showPostCta: false,
  },
  published: {
    title: "No published listings",
    description: "Approved properties go live here. Submit a draft when you are ready to be reviewed.",
    showPostCta: false,
  },
  rejected: {
    title: "No rejected listings",
    description: "If a property is declined during review, it will appear here with the reason so you can fix and resubmit.",
    showPostCta: false,
  },
  closed: {
    title: "No closed listings",
    description: "Listings you close stop appearing publicly. They show up here, and you can reopen them when you are ready.",
    showPostCta: false,
  },
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: "Draft",
  pending: "In review",
  published: "Published",
  rejected: "Rejected",
  closed: "Closed",
};

export const STATUS_BADGE_CLASSES: Record<PropertyStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-zinc-200 text-zinc-700",
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: "Sale",
  "rent-lease": "Rent",
};

const PG_PROPERTY_TYPE = "pg-co-living";

export type StatusAction = "submit" | "close" | "reopen";

const STATUS_ACTIONS: Partial<Record<PropertyStatus, StatusAction>> = {
  draft: "submit",
  published: "close",
  closed: "reopen",
};

export const STATUS_ACTION_LABELS: Record<StatusAction, string> = {
  submit: "Submit for review",
  close: "Close listing",
  reopen: "Reopen",
};

const priceFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export type PropertyListPriceFields = Pick<PropertyListItem, "price" | "listingType"> &
  Partial<Pick<PropertyListItem, "priceMin" | "priceMax">>;

type PriceFields = PropertyListPriceFields;

export const formatPriceAmount = (amount: number) => `₹${priceFormatter.format(amount)}`;

const formatAmount = formatPriceAmount;

export function hasPropertyPriceRange(item: PriceFields): boolean {
  const min = item.priceMin ?? item.price;
  const max = item.priceMax ?? min;
  return min != null && max != null && max !== min;
}

// Shows a min - max range when the sub types of one post are priced differently
export function formatPrice(item: PriceFields): string {
  const min = item.priceMin ?? item.price;
  const max = item.priceMax ?? min;
  if (min === null || min === undefined) {
    return "Price on request";
  }

  const amount = max !== null && max !== min ? `${formatAmount(min)} - ${formatAmount(max)}` : formatAmount(min);
  return item.listingType === "rent-lease" ? `${amount}/month` : amount;
}

export const getHeading = (item: Pick<PropertyListItem, "title" | "projectName">): string =>
  item.projectName || item.title;

export function getListingLabel(item: Pick<PropertyListItem, "listingType" | "propertyType">): string {
  return item.propertyType === PG_PROPERTY_TYPE ? "PG" : (LISTING_TYPE_LABELS[item.listingType] ?? item.listingType);
}

export function getSubtitle(item: Pick<PropertyListItem, "subType" | "city"> & Partial<Pick<PropertyListItem, "subTypes">>): string {
  const subTypes = item.subTypes?.length ? item.subTypes : [item.subType];
  return [subTypes.map(({ name }) => name).join(", "), item.city].filter(Boolean).join(" · ");
}

export function getStatusAction(status: PropertyStatus): StatusAction | null {
  return STATUS_ACTIONS[status] ?? null;
}

export function formatPostedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const getEditHref = (id: string) => `/post-property?edit=${id}`;
