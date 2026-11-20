// The table and its skeleton share this grid, so the loading state matches the real layout
export const PAYMENT_GRID_CLASS = "grid grid-cols-[1.3fr_1.2fr_1fr_0.8fr_0.8fr] items-center gap-4";

export const PAYMENT_TABLE_MIN_WIDTH_CLASS = "min-w-[760px]";

export const PAYMENT_TABLE_COLUMNS = ["Order", "Plan", "Amount", "Status", "Invoice"] as const;
