const { normalizeCriteria, buildCriteriaHash } = require("./recent-searches.criteria");

const criteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: ["Bopal", "GIFT City"],
  projects: [],
  bedrooms: [3, 2],
  more: { postedSince: "", amenities: [] },
  page: 1,
};

describe("normalizeCriteria", () => {
  it("drops page and empty values", () => {
    expect(normalizeCriteria(criteria)).toEqual({
      transaction: "property-for-sale",
      category: "residential-real-estate",
      cityName: "ahmedabad",
      localities: ["bopal", "gift city"],
      bedrooms: [2, 3],
    });
  });

  it("keeps meaningful booleans and numbers", () => {
    const result = normalizeCriteria({ budgetMin: 0, more: { hasRera: true, hasPhotos: false } });

    expect(result).toEqual({ budgetMin: 0, more: { hasPhotos: false, hasRera: true } });
  });

  it("does not mutate the input", () => {
    normalizeCriteria(criteria);

    expect(criteria.localities).toEqual(["Bopal", "GIFT City"]);
    expect(criteria.page).toBe(1);
  });
});

describe("buildCriteriaHash", () => {
  it("is a 64 character hex digest", () => {
    expect(buildCriteriaHash(criteria)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("ignores array order, casing, key order and page", () => {
    const reordered = {
      page: 4,
      bedrooms: [2, 3],
      localities: ["gift city", " BOPAL "],
      cityName: "ahmedabad",
      category: "residential-real-estate",
      transaction: "property-for-sale",
    };

    expect(buildCriteriaHash(reordered)).toBe(buildCriteriaHash(criteria));
  });

  it("changes when a filter changes", () => {
    expect(buildCriteriaHash({ ...criteria, bedrooms: [2] })).not.toBe(buildCriteriaHash(criteria));
  });
});
