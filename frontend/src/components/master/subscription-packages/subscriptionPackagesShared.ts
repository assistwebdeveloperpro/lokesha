import { formatRupees } from "@/lib/currency";
import type {
  SubscriptionPackage,
  SubscriptionPackageCode,
  SubscriptionPackageStatus,
  UpdateSubscriptionPackageInput,
} from "@/services/adminSubscription.service";

export const AUDIT_PAGE_SIZE = 5;
export const MAX_BENEFITS = 10;

const MAX_PRICE = 100000;

export type PackageFormState = {
  name: string;
  displayTitle: string;
  description: string;
  benefits: string[];
  status: SubscriptionPackageStatus;
  displayOrder: string;
  price: string;
  pricePerLead: string;
  gstPercent: string;
  minLeads: string;
  maxLeads: string;
  minListings: string;
  maxListings: string;
  minMonths: string;
  maxMonths: string;
  allowCustomQuantity: boolean;
  allowCustomDuration: boolean;
  freeCredits: string;
  freeLeadLimit: string;
  freePropertyValidityDays: string;
};

export type PackageFormErrors = Partial<Record<keyof PackageFormState, string>>;

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export const formatRupeesInput = (rupees: number) => String(rupees);

function parseNumber(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

const parseInteger = (text: string) => {
  const value = parseNumber(text);
  return value !== null && Number.isInteger(value) ? value : null;
};

export const parseRupees = parseInteger;

const toText = (value: number | null) => (value === null ? "" : String(value));

export function toFormState(pkg: SubscriptionPackage): PackageFormState {
  return {
    name: pkg.name,
    displayTitle: pkg.displayTitle,
    description: pkg.description,
    benefits: [...pkg.benefits],
    status: pkg.status,
    displayOrder: String(pkg.displayOrder),
    price: formatRupeesInput(pkg.pricePerListingMonth),
    pricePerLead: toText(pkg.pricePerLead),
    gstPercent: String(pkg.gstPercent),
    minLeads: toText(pkg.minLeads),
    maxLeads: toText(pkg.maxLeads),
    minListings: String(pkg.minListings),
    maxListings: String(pkg.maxListings),
    minMonths: String(pkg.minMonths),
    maxMonths: String(pkg.maxMonths),
    allowCustomQuantity: pkg.allowCustomQuantity,
    allowCustomDuration: pkg.allowCustomDuration,
    freeCredits: toText(pkg.freeCredits),
    freeLeadLimit: toText(pkg.freeLeadLimit),
    freePropertyValidityDays: toText(pkg.freePropertyValidityDays),
  };
}

type IntegerRule = { field: keyof PackageFormState; label: string; min: number; max: number };

const COMMON_RULES: IntegerRule[] = [{ field: "displayOrder", label: "Display order", min: 0, max: 1000 }];

const FREE_RULES: IntegerRule[] = [
  { field: "freeCredits", label: "Free listings", min: 1, max: 1000 },
  { field: "freeLeadLimit", label: "Lead limit", min: 1, max: 1000 },
  { field: "freePropertyValidityDays", label: "Listing validity", min: 1, max: 3650 },
];

const STANDARD_RULES: IntegerRule[] = [
  { field: "minListings", label: "Minimum listings", min: 1, max: 1000 },
  { field: "maxListings", label: "Maximum listings", min: 1, max: 1000 },
  { field: "minMonths", label: "Minimum months", min: 1, max: 60 },
  { field: "maxMonths", label: "Maximum months", min: 1, max: 60 },
];

const LEAD_PACK_RULES: IntegerRule[] = [
  { field: "minLeads", label: "Minimum leads", min: 1, max: 1000 },
  { field: "maxLeads", label: "Maximum leads", min: 1, max: 1000 },
];

const RULES_BY_CODE: Record<SubscriptionPackageCode, IntegerRule[]> = {
  free: FREE_RULES,
  standard: STANDARD_RULES,
  leads: LEAD_PACK_RULES,
};

const PRICE_ERROR = "Price must be a whole number from ₹0 to ₹1,00,000";

// A range only gets the order check when both ends are valid on their own
function checkRange(errors: PackageFormErrors, form: PackageFormState, minField: keyof PackageFormState, maxField: keyof PackageFormState, label: string) {
  const min = parseInteger(String(form[minField]));
  const max = parseInteger(String(form[maxField]));
  if (!errors[maxField] && min !== null && max !== null && max < min) {
    errors[maxField] = `Maximum ${label} cannot be less than minimum`;
  }
}

export function validatePackageForm(form: PackageFormState, code: SubscriptionPackageCode): PackageFormErrors {
  const errors: PackageFormErrors = {};

  if (!form.name.trim()) errors.name = "Enter a package name";
  else if (form.name.trim().length > 80) errors.name = "Name must be 80 characters or fewer";

  if (!form.displayTitle.trim()) errors.displayTitle = "Enter a display title";
  else if (form.displayTitle.trim().length > 120) errors.displayTitle = "Title must be 120 characters or fewer";

  if (form.description.trim().length > 1000) errors.description = "Description must be 1000 characters or fewer";
  if (form.benefits.some((benefit) => !benefit.trim())) errors.benefits = "Remove or fill the empty benefit points";

  for (const { field, label, min, max } of [...COMMON_RULES, ...RULES_BY_CODE[code]]) {
    const value = parseInteger(String(form[field]));
    if (value === null || value < min || value > max) errors[field] = `${label} must be a whole number from ${min} to ${max}`;
  }

  if (code === "free") return errors;

  const priceField = code === "leads" ? "pricePerLead" : "price";
  const price = parseRupees(form[priceField]);
  if (price === null || price < 0 || price > MAX_PRICE) errors[priceField] = PRICE_ERROR;

  const gst = parseNumber(form.gstPercent);
  if (gst === null || gst < 0 || gst > 100) errors.gstPercent = "GST must be from 0 to 100";

  if (code === "leads") {
    checkRange(errors, form, "minLeads", "maxLeads", "leads");
  } else {
    checkRange(errors, form, "minListings", "maxListings", "listings");
    checkRange(errors, form, "minMonths", "maxMonths", "months");
  }

  return errors;
}

const isSame = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

// Sends only the fields this package type owns and that actually changed; call after the form is valid
const getPackageSettings = (code: SubscriptionPackageCode, form: PackageFormState): UpdateSubscriptionPackageInput => {
  if (code === "free") {
    return {
      freeCredits: Number(form.freeCredits),
      freeLeadLimit: Number(form.freeLeadLimit),
      freePropertyValidityDays: Number(form.freePropertyValidityDays),
    };
  }

  if (code === "leads") {
    return {
      pricePerLead: parseRupees(form.pricePerLead) ?? 0,
      gstPercent: Number(form.gstPercent),
      minLeads: Number(form.minLeads),
      maxLeads: Number(form.maxLeads),
    };
  }

  return {
    pricePerListingMonth: parseRupees(form.price) ?? 0,
    gstPercent: Number(form.gstPercent),
    minListings: Number(form.minListings),
    maxListings: Number(form.maxListings),
    minMonths: Number(form.minMonths),
    maxMonths: Number(form.maxMonths),
    allowCustomQuantity: form.allowCustomQuantity,
    allowCustomDuration: form.allowCustomDuration,
  };
};

export function buildUpdateInput(pkg: SubscriptionPackage, form: PackageFormState): UpdateSubscriptionPackageInput {
  const next: UpdateSubscriptionPackageInput = {
    name: form.name.trim(),
    displayTitle: form.displayTitle.trim(),
    description: form.description.trim(),
    benefits: form.benefits.map((benefit) => benefit.trim()),
    status: form.status,
    displayOrder: Number(form.displayOrder),
    ...getPackageSettings(pkg.code, form),
  };

  return Object.fromEntries(
    Object.entries(next).filter(([field, value]) => !isSame(pkg[field as keyof SubscriptionPackage], value)),
  ) as UpdateSubscriptionPackageInput;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  displayTitle: "Display title",
  description: "Description",
  benefits: "Benefit points",
  status: "Status",
  displayOrder: "Display order",
  pricePerListingMonth: "Price per listing per month",
  pricePerLead: "Price per lead",
  minLeads: "Minimum leads",
  maxLeads: "Maximum leads",
  gstPercent: "GST",
  minListings: "Minimum listings",
  maxListings: "Maximum listings",
  minMonths: "Minimum months",
  maxMonths: "Maximum months",
  allowCustomQuantity: "Custom quantity",
  allowCustomDuration: "Custom duration",
  freeCredits: "Free listings",
  freeLeadLimit: "Lead limit per listing",
  freePropertyValidityDays: "Listing validity",
};

export const getFieldLabel = (field: string) => FIELD_LABELS[field] ?? field;

export function formatChangeValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "pricePerListingMonth" || field === "pricePerLead") return formatRupees(Number(value));
  if (field === "gstPercent") return `${value}%`;
  if (field === "freePropertyValidityDays") return `${value} days`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(" • ") : "—";
  if (field === "status") return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  return String(value);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}
