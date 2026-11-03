import { describe, expect, it } from "vitest";
import type { PublicSearchListing } from "./publicSearchListing.types";
import { NO_CITY_MESSAGE, resolveSearchEmptyState } from "./searchEmptyState";

const listing = { id: "p1" } as PublicSearchListing;

describe("resolveSearchEmptyState", () => {
  it("shows only the fixed message when no city is selected", () => {
    expect(resolveSearchEmptyState({}, [listing])).toEqual({
      message: NO_CITY_MESSAGE,
      suggestionsTitle: null,
    });
  });

  it("names the city and introduces its other localities", () => {
    expect(resolveSearchEmptyState({ cityName: "Ahmedabad" }, [listing])).toEqual({
      message: "No properties found for your search in Ahmedabad.",
      suggestionsTitle: "Properties in other localities of Ahmedabad",
    });
  });

  it("shows no heading when the city has no other listings", () => {
    expect(resolveSearchEmptyState({ cityName: "Pune" }, []).suggestionsTitle).toBeNull();
  });
});
