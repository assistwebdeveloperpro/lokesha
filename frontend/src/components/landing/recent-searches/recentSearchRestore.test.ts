import { describe, expect, it } from "vitest";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import { parseSearchUrl } from "@/lib/property-search-url/parseSearchUrl";
import type { RecentSearchCriteria } from "@/services/recentSearches.service";
import { getRecentSearchHref } from "./recentSearchRestore";

const buildCriteria = (overrides: Partial<RecentSearchCriteria> = {}): RecentSearchCriteria => ({
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: ["Bopal"],
  projects: [],
  bedrooms: [2, 3],
  propertyTypes: ["flat-apartment"],
  constructionStatuses: [],
  saleTypes: [],
  occupancies: [],
  genders: [],
  postedBy: [],
  budgetMin: 500000,
  budgetMax: 4300000,
  more: { ...EMPTY_MORE_FILTERS },
  ...overrides,
});

// Mirrors the server: json drops undefined and the stored object has no page
const throughStorage = (criteria: RecentSearchCriteria): RecentSearchCriteria =>
  JSON.parse(JSON.stringify(criteria));

function parseHref(href: string) {
  const url = new URL(href, "https://lokesha.test");
  const [transaction, category] = url.pathname.split("/").filter(Boolean);
  const searchParams = Object.fromEntries(url.searchParams);

  return parseSearchUrl({ transaction, category, searchParams });
}

describe("getRecentSearchHref", () => {
  it("rebuilds a search url that parses back to the stored filters", () => {
    const criteria = buildCriteria();

    const parsed = parseHref(getRecentSearchHref({ searchCriteria: throughStorage(criteria) }));

    expect(parsed).toMatchObject({
      transaction: "property-for-sale",
      category: "residential-real-estate",
      cityName: "Ahmedabad",
      localities: ["Bopal"],
      bedrooms: [2, 3],
      budgetMin: 500000,
      budgetMax: 4300000,
      page: 1,
    });
  });

  it("always opens the first page", () => {
    const href = getRecentSearchHref({ searchCriteria: buildCriteria() });

    expect(href).not.toContain("page=");
  });

  it("uses the keyword path for plots", () => {
    const href = getRecentSearchHref({
      searchCriteria: buildCriteria({ category: "plot", bedrooms: [], propertyTypes: [] }),
    });

    expect(href.startsWith("/plots-for-sale")).toBe(true);
  });

  it("falls back to the category landing page for an unsearchable combination", () => {
    const href = getRecentSearchHref({
      searchCriteria: buildCriteria({
        transaction: "property-for-lease",
        category: "residential-real-estate",
      }),
    });

    expect(href).toBe("/property-for-sale-rent-in-Ahmedabad/residential-real-estate-Ahmedabad");
  });

  it("falls back home for an unknown category", () => {
    const href = getRecentSearchHref({
      searchCriteria: buildCriteria({ category: "villas" as never }),
    });

    expect(href).toBe("/");
  });
});
