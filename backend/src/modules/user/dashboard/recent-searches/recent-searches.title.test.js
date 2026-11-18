const { buildSearchTitle, buildSearchSubtitle, formatPriceShort } = require("./recent-searches.title");

const base = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  localities: [],
  projects: [],
  bedrooms: [],
  propertyTypes: [],
};

describe("buildSearchTitle", () => {
  it.each([
    [
      { ...base, bedrooms: [4], propertyTypes: ["flat-apartment"], budgetMin: 500000, budgetMax: 43000000, cityName: "Ahmedabad" },
      "Buy 4 BHK Flat/Apartment 5 Lac - 4.3 Cr in Ahmedabad",
    ],
    [
      {
        ...base,
        transaction: "property-for-rent",
        category: "commercial-real-estate",
        propertyTypes: ["shop"],
        budgetMin: 29000,
        budgetMax: 88000,
        localities: ["GIFT City"],
        cityName: "Gandhinagar",
      },
      "Rent Shop 29K - 88K in GIFT City, Gandhinagar",
    ],
    [
      { ...base, propertyTypes: ["flat-apartment"], localities: ["Bopal"], cityName: "Ahmedabad" },
      "Buy Flat/Apartment in Bopal, Ahmedabad",
    ],
    [{ ...base, category: "land", cityName: "Gandhinagar" }, "Buy Land property in Gandhinagar"],
    [
      { ...base, category: "land", transaction: "property-for-rent", cityName: "Gandhinagar" },
      "Rent Land property in Gandhinagar",
    ],
    [{ ...base, category: "pg-co-living", cityName: "Gandhinagar" }, "PG in Gandhinagar"],
    [{ ...base, cityName: "Ahmedabad" }, "Buy Residential property in Ahmedabad"],
  ])("builds the title for %#", (criteria, title) => {
    expect(buildSearchTitle(criteria)).toBe(title);
  });

  it("joins several bedrooms and property types", () => {
    const title = buildSearchTitle({
      ...base,
      bedrooms: [3, 2],
      propertyTypes: ["flat-apartment", "bungalow-villa"],
      cityName: "Surat",
    });

    expect(title).toBe("Buy 2, 3 BHK Flat/Apartment, Bungalow/Villa in Surat");
  });

  it("capitalises lowercase locations and leaves project names out", () => {
    const title = buildSearchTitle({ ...base, projects: ["shyam swastik"], localities: ["bopal"], cityName: "Ahmedabad" });

    expect(title).toBe("Buy Residential property in Bopal, Ahmedabad");
  });

  it("shows one-sided prices and area", () => {
    expect(buildSearchTitle({ ...base, budgetMin: 500000 })).toBe("Buy Residential property Min 5 Lac");
    expect(buildSearchTitle({ ...base, budgetMax: 88000, areaMin: 1000, areaMax: 2000 })).toBe(
      "Buy Residential property Up to 88K 1,000 - 2,000 sq ft"
    );
  });

  it("omits the location when none is selected", () => {
    expect(buildSearchTitle(base)).toBe("Buy Residential property");
  });

  it("never exceeds the column length", () => {
    const localities = Array.from({ length: 50 }, (_, index) => `Locality number ${index}`);

    expect(buildSearchTitle({ ...base, localities }).length).toBeLessThanOrEqual(255);
  });
});

describe("buildSearchSubtitle", () => {
  it("is the location without the preposition", () => {
    expect(buildSearchSubtitle({ ...base, localities: ["Bopal"], cityName: "Ahmedabad" })).toBe("Bopal, Ahmedabad");
  });

  it("falls back to the city, then null", () => {
    expect(buildSearchSubtitle({ ...base, cityName: "Surat" })).toBe("Surat");
    expect(buildSearchSubtitle(base)).toBeNull();
  });
});

describe("formatPriceShort", () => {
  it.each([
    [999, "999"],
    [29000, "29K"],
    [500000, "5 Lac"],
    [43000000, "4.3 Cr"],
    [10000000, "1 Cr"],
    [150000, "1.5 Lac"],
  ])("formats %p as %p", (amount, expected) => {
    expect(formatPriceShort(amount)).toBe(expected);
  });
});
