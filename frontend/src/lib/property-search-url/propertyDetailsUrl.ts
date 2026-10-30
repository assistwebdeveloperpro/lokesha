import { toUrlSegment } from "./slug";

export const PROPERTY_DETAILS_BASE = "/property-details";

const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const SLUG_ID_PATTERN = new RegExp(`^(.*?)&id=(${UUID_PATTERN})$`, "i");

export type PropertyDetailsSource = {
  id: string;
  bedrooms: number | null;
  carpetArea: number | null;
  carpetAreaUnit: string | null;
  propertySubType: string | null;
  propertyType: string;
  listingType: string;
  locality: string;
  city: string | null;
};

// "sq-ft" -> "Sq ft", "penthouse" -> "Penthouse"
const humanize = (value: string) => {
  const text = value.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const listingLabel = (listingType: string) =>
  listingType === "sale" ? "Sale" : "Rent";

function buildDescriptor(source: PropertyDetailsSource): string {
  const area =
    source.carpetArea && source.carpetAreaUnit
      ? `${source.carpetArea} ${humanize(source.carpetAreaUnit)}`
      : null;

  return [
    source.bedrooms ? `${source.bedrooms} BHK` : null,
    area,
    humanize(source.propertySubType ?? source.propertyType),
    `FOR ${listingLabel(source.listingType)}`,
    source.locality,
    source.city ? `in ${source.city}` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .map(toUrlSegment)
    .join("-");
}

// 4-BHK-5500-Sq-ft-Penthouse-FOR-Sale-South-Bopal-in-Ahmedabad&id={id}
export function buildPropertyDetailsSlug(source: PropertyDetailsSource): string {
  return `${buildDescriptor(source)}&id=${source.id}`;
}

export function buildPropertyDetailsUrl(source: PropertyDetailsSource): string {
  return `${PROPERTY_DETAILS_BASE}/${buildPropertyDetailsSlug(source)}`;
}

// Next passes the segment percent-encoded, e.g. "%26id%3D".
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function parsePropertyDetailsSlug(
  slug: string,
): { id: string; descriptor: string } | null {
  const match = SLUG_ID_PATTERN.exec(decodeSlug(slug));
  if (!match) return null;
  return { id: match[2].toLowerCase(), descriptor: match[1] };
}

// Returns the canonical url when the requested slug is stale, else null.
export function getCanonicalDetailsRedirect(
  requestedSlug: string,
  source: PropertyDetailsSource,
): string | null {
  const canonicalSlug = buildPropertyDetailsSlug(source);
  return decodeSlug(requestedSlug) === canonicalSlug
    ? null
    : `${PROPERTY_DETAILS_BASE}/${canonicalSlug}`;
}
