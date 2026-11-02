import { describe, expect, it } from "vitest";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import {
  buildResultsCountLine,
  buildSearchListBreadcrumbs,
  buildShowingRange,
} from "./buildPropertySearchListPageMeta";
import { MOCK_PUBLIC_SEARCH_LISTINGS } from "./mockPublicSearchListings";

const criteria: PropertySearchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: ["Naroda"],
  projects: [],
  bedrooms: [],
  propertyTypes: ["flat-apartment"],
  constructionStatuses: [],
  saleTypes: [],
  occupancies: [],
  genders: [],
  postedBy: [],
  more: { ...EMPTY_MORE_FILTERS },
  page: 1,
};

describe("buildPropertySearchListPageMeta", () => {
  it("builds breadcrumb trail for city and locality", () => {
    const crumbs = buildSearchListBreadcrumbs(criteria);
    expect(crumbs[0]).toEqual({ label: "Home", href: "/" });
    expect(crumbs[1]?.label).toBe("Flats for Sale in Ahmedabad");
    expect(crumbs[2]?.label).toBe("Flats for Sale in Naroda - Ahmedabad");
  });

  it("formats results and pagination lines", () => {
    expect(buildResultsCountLine(1746, criteria)).toBe(
      "1,746 Results | Flats for Sale in Naroda, Ahmedabad",
    );
    expect(buildShowingRange(1, 30, 1746)).toBe("Showing 1 - 30 of 1,746");
  });

  it("uses mock listings for SEO without throwing", () => {
    expect(MOCK_PUBLIC_SEARCH_LISTINGS).toHaveLength(5);
  });
});
