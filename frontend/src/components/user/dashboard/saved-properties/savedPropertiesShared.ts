import { formatSearchListingPrice } from "@/components/landing/property-search/property-list/buildSearchListingFacts";
import type { PublicSearchListing } from "@/components/landing/property-search/property-list/publicSearchListing.types";
import type { SavedProperty, SavedPropertyListing } from "@/services/savedProperties.service";

export const SAVED_PAGE_SIZE = 12;

// Same breakpoints as Manage Properties; shared by the real grid and the skeleton
export const SAVED_GRID_CLASS =
  "grid grid-cols-1 gap-4 [&>*]:min-w-0 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4";

export const SAVED_CARD_IMAGE_ASPECT_CLASS = "aspect-[4/3]";

export const SAVED_EMPTY_STATE = {
  title: "No Shortlisted properties yet",
  description: "Tap the heart on any property to keep it here and come back to it anytime.",
};

const NEW_SAVE_WINDOW_MS = 48 * 60 * 60 * 1000;
const PRICE_ON_REQUEST_LABEL = "Price On Request";

export function isNewSave(savedAt: string, now: number = Date.now()): boolean {
  return now - new Date(savedAt).getTime() < NEW_SAVE_WINDOW_MS;
}

export function isSavedListing(property: SavedProperty["property"]): property is SavedPropertyListing {
  return "imageUrls" in property;
}

export function getSavedLocation(property: SavedProperty["property"]): string {
  return [property.locality, property.city].filter(Boolean).join(", ");
}

export function getSavedPriceLabel(listing: PublicSearchListing): string {
  const hasPrice = (listing.priceMin ?? listing.price) !== null;
  return hasPrice ? formatSearchListingPrice(listing) : PRICE_ON_REQUEST_LABEL;
}

// The slider falls back to the main image when no gallery images exist
export function getSavedImages(listing: SavedPropertyListing): string[] {
  if (listing.imageUrls.length > 0) return listing.imageUrls;
  return listing.imageUrl ? [listing.imageUrl] : [];
}

// Last page that still holds rows after one is removed
export function getPageAfterRemoval(page: number, itemsOnPage: number): number {
  return itemsOnPage <= 1 && page > 1 ? page - 1 : page;
}
