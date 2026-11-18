import type { ContactedAvailability } from "@/services/userContactedProperties.service";

export const CONTACTED_PAGE_SIZE = 10;

export const CONTACTED_TABS: { value: ContactedAvailability; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "No longer available" },
];

export const CONTACTED_TABLE_COLUMNS = [
  "Property",
  "Price & Area",
  "Contact Person",
  "Contacted",
  "Status",
  "Action",
] as const;

// Shared by header, rows and skeleton so the columns always line up
export const CONTACTED_GRID_CLASS =
  "grid grid-cols-[1.5fr_1.5fr_1.1fr_0.9fr_0.7fr_0.9fr] text-nowrap items-center gap-4";

export const CONTACTED_TABLE_MIN_WIDTH_CLASS = "min-w-[1100px]";

export const CONTACTED_EMPTY_STATES: Record<"all" | "filtered", { title: string; description: string }> = {
  all: {
    title: "No contacted properties yet",
    description: "Properties you contact will appear here so you can follow up on them anytime.",
  },
  filtered: {
    title: "Nothing in this view",
    description: "No contacted properties match this filter. Try another tab.",
  },
};
