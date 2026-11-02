import type { PublicSearchListing } from "./publicSearchListing.types";

const humanizeUnit = (unit: string) => unit.replace(/-/g, " ");

export function formatSearchListingArea(listing: PublicSearchListing): string {
  const unit = humanizeUnit(listing.carpetAreaUnit);
  const { carpetAreaMin, carpetAreaMax } = listing;

  if (carpetAreaMin !== null && carpetAreaMax !== null && carpetAreaMin !== carpetAreaMax) {
    return `${carpetAreaMin.toLocaleString("en-IN")} ${unit} - ${carpetAreaMax.toLocaleString("en-IN")} ${unit}`;
  }
  if (carpetAreaMin !== null) {
    return `${carpetAreaMin.toLocaleString("en-IN")} ${unit}`;
  }
  return "—";
}
