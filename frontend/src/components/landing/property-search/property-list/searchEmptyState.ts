import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import type { PublicSearchListing } from "./publicSearchListing.types";

export const NO_CITY_MESSAGE = "There are no search related property is available.";

export type SearchEmptyState = {
  message: string;
  suggestionsTitle: string | null;
};

// A city shows its other localities after the message; without a city there is only the message
export function resolveSearchEmptyState(
  criteria: Pick<PropertySearchCriteria, "cityName">,
  otherLocalities: PublicSearchListing[],
): SearchEmptyState {
  const city = criteria.cityName?.trim();
  if (!city) return { message: NO_CITY_MESSAGE, suggestionsTitle: null };

  return {
    message: `No properties found for your search in ${city}.`,
    suggestionsTitle:
      otherLocalities.length > 0 ? `Properties in other localities of ${city}` : null,
  };
}