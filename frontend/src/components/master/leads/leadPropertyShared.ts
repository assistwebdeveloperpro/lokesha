import { formatPriceAmount } from "@/components/user/dashboard/manage-properties/managePropertiesShared";
import type { PayloadFields, PropertyListingPayload, PropertyMediaFileDto } from "@/services/property.service";

export type FactRow = { label: string; value: string };

const MAIN_PHOTO_CATEGORY = "main-photo";

const AGE_LABELS: Record<string, string> = {
  "lt-1": "Less than 1 year",
  "1-to-2": "1 to 2 years",
  "2-to-3": "2 to 3 years",
  "3-to-5": "3 to 5 years",
  "gt-5": "More than 5 years",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export const humanize = (value: string): string =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

const toLabel = (value: unknown): string | null => {
  const text = toText(value);
  return text ? humanize(text) : null;
};

const toCount = (value: unknown): string | null => toNumber(value)?.toString() ?? null;

const toMoney = (value: unknown): string | null => {
  const amount = toNumber(value);
  return amount === null ? null : formatPriceAmount(amount);
};

function toDate(value: unknown): string | null {
  const text = toText(value);
  return text ? DATE_FORMAT.format(new Date(text)) : null;
}

function toYesNo(value: unknown): string | null {
  if (value === true) return "Yes";
  return value === false ? "No" : null;
}

function formatArea(fields: PayloadFields | undefined, key: string): string | null {
  const area = toNumber(fields?.[key]);
  if (area === null) return null;
  const unit = toText(fields?.[`${key}Unit`]);
  return `${area.toLocaleString("en-IN")} ${unit ? unit.replace(/-/g, " ") : "sq ft"}`;
}

export type ContactRow = { key: "mobile" | "email"; label: string; value: string };

const STAFF_LISTED_BY = new Set(["lokesha_staff", "admin"]);

// Staff and admin list on behalf of an owner, so only the owner's own contact is shown for them
export function getListerContacts(
  listedBy: string | null,
  owner: { mobile: string; email: string },
  ownerContact: PayloadFields | undefined,
): ContactRow[] {
  const isStaffListed = listedBy !== null && STAFF_LISTED_BY.has(listedBy);
  const mobile = isStaffListed ? toText(ownerContact?.mobileNumber) : toText(owner.mobile);
  const email = isStaffListed ? toText(ownerContact?.email) : toText(owner.email);
  const labels = isStaffListed ? { mobile: "Owner mobile number", email: "Owner email" } : { mobile: "Mobile", email: "Email" };

  return [
    ...(mobile ? [{ key: "mobile" as const, label: labels.mobile, value: mobile }] : []),
    ...(email ? [{ key: "email" as const, label: labels.email, value: email }] : []),
  ];
}

// The main photo comes first, the rest keep their order
export function getImages(media: PropertyMediaFileDto[]): PropertyMediaFileDto[] {
  const images = media.filter((file) => file.mediaType === "image");
  const main = images.find((file) => file.category === MAIN_PHOTO_CATEGORY);
  return main ? [main, ...images.filter((file) => file !== main)] : images;
}

export function getAddressLines(address: PayloadFields): { street: string; region: string } {
  const join = (keys: string[]) =>
    keys
      .map((key) => toText(address[key]))
      .filter(Boolean)
      .join(", ");

  return {
    street: join(["flatNumber", "blockNo", "addressLine2", "locality"]),
    region: [join(["city", "state"]), toText(address.pinCode)].filter(Boolean).join(" - "),
  };
}

// Falls back to the unit prices of a builder listing, then to the price saved on the property
export function getListingPrice(
  listing: PropertyListingPayload,
  fallbackPrice: number | null = null,
): { label: string; value: string } | null {
  const rent = toNumber(listing.pricing.monthlyRent);
  if (rent !== null) return { label: "Monthly rent", value: formatPriceAmount(rent) };

  const sale = toNumber(listing.pricing.expectedPrice);
  if (sale !== null) return { label: "Expected price", value: formatPriceAmount(sale) };

  const unitPrices = (listing.variants ?? []).map((variant) => toNumber(variant.price)).filter((price) => price !== null);
  if (unitPrices.length) {
    const [min, max] = [Math.min(...unitPrices), Math.max(...unitPrices)];
    const value = min === max ? formatPriceAmount(min) : `${formatPriceAmount(min)} - ${formatPriceAmount(max)}`;
    return { label: "Starting price", value };
  }

  return fallbackPrice === null ? null : { label: "Price", value: formatPriceAmount(fallbackPrice) };
}

function formatFloor(details: PayloadFields | undefined): string | null {
  const floor = toNumber(details?.floorNumber);
  if (floor === null) return null;
  const total = toNumber(details?.totalFloors);
  return total === null ? String(floor) : `${floor} out of ${total}`;
}

// Same rows as the Property Details card of the public page, empty ones are left out
export function getListingFacts(listing: PropertyListingPayload): FactRow[] {
  const { details, pricing, construction } = listing;
  const isRent = toNumber(pricing.monthlyRent) !== null;
  const age = toText(details?.ageOfConstruction);
  const parking = toNumber(details?.carParkingCount);

  const rows: Array<[string, string | null]> = [
    ["Property Transaction", toLabel(details?.propertyTransaction)],
    ["Construction Status", toLabel(construction?.status)],
    ["Possession Date", toDate(construction?.possessionDate)],
    ["Furnishing Status", toLabel(details?.furnishingStatus)],
    ["Bedrooms", toCount(details?.bedrooms)],
    ["Bathrooms", toCount(details?.bathrooms)],
    ["Balconies", toCount(details?.balconies)],
    ["Super Built-up Area", formatArea(details, "superBuiltUpArea")],
    ["Carpet Area", formatArea(details, "carpetArea")],
    ["Plot Area", formatArea(listing.plotDetails, "plotArea")],
    ["Property Age", age ? (AGE_LABELS[age] ?? humanize(age)) : null],
    ["Floor Number", formatFloor(details)],
    ["Lifts", toCount(details?.lifts)],
    ["Open Sides", toCount(details?.openSides)],
    ["Facing", toLabel(listing.facing)],
    ["Available From", toDate(listing.availableFrom)],
    ...(isRent
      ? ([
          ["Monthly Rent", toMoney(pricing.monthlyRent)],
          ["Security Deposit", toMoney(pricing.depositAmount)],
          ["Notice Period", toNumber(pricing.noticePeriodMonths) === null ? null : `${pricing.noticePeriodMonths} months`],
        ] as Array<[string, string | null]>)
      : ([
          ["Booking Amount", toMoney(pricing.bookingAmount)],
          ["Transfer Fee", toMoney(pricing.transferFee)],
          ["Rera Id", toText(pricing.reraNumber)],
        ] as Array<[string, string | null]>)),
    ["Maintenance Charges", toMoney(pricing.maintenanceCharges)],
    ["Car Parking", parking === null ? null : parking === 0 ? "None" : String(parking)],
    ["Club Membership", toYesNo(details?.clubMembership)],
    ["Price Negotiable", toYesNo(pricing.priceNegotiable)],
  ];

  return rows.flatMap(([label, value]) => (value ? [{ label, value }] : []));
}

export type VariantRow = { id: string; name: string; area: string | null; price: string | null };

// Unit types of a builder listing
export function getVariantRows(listing: PropertyListingPayload): VariantRow[] {
  return (listing.variants ?? []).flatMap((variant, index) => {
    const name = toText(variant.label);
    const price = toMoney(variant.price);
    if (!name && !price) return [];

    const size = toNumber(variant.size);
    const area = size === null ? null : `${size.toLocaleString("en-IN")} ${(variant.sizeUnit ?? "sq ft").replace(/-/g, " ")}`;
    return [{ id: `${index}-${name ?? "unit"}`, name: name ?? "Unit", area, price }];
  });
}
