const { getRule } = require("./property.constants");
const {
  toSqft,
  deriveAreaSqft,
  derivePrice,
  deriveVariantPriceRange,
  deriveTitle,
} = require("./property.derive");

const flatRule = getRule("residential", "flat-apartment");
const plotRule = getRule("plot", "residential-plot");

describe("toSqft", () => {
  it.each([
    [10, "sq-ft", 10],
    [1, "sq-m", 10.76],
    [2, "sq-yd", 18],
    [1, "acres", 43560],
    [1, "guntha", 1089],
    [1, "bigha", 27225],
  ])("converts %s %s", (value, unit, expected) => {
    expect(toSqft(value, unit)).toBe(expected);
  });

  it("defaults to sq ft and handles missing or oversized values", () => {
    expect(toSqft(5)).toBe(5);
    expect(toSqft(undefined, "sq-ft")).toBeNull();
    expect(toSqft(5000, "sq-km")).toBeNull();
  });
});

describe("deriveAreaSqft", () => {
  it("uses carpet area, then super built up, then plot area", () => {
    expect(deriveAreaSqft(flatRule, { details: { carpetArea: 100, superBuiltUpArea: 200 } })).toBe(100);
    expect(deriveAreaSqft(flatRule, { details: { superBuiltUpArea: 200 } })).toBe(200);
    expect(deriveAreaSqft(flatRule, { details: {}, plotDetails: { plotArea: 1, plotAreaUnit: "guntha" } })).toBe(1089);
  });

  it("uses the plot area for plots", () => {
    expect(deriveAreaSqft(plotRule, { plotDetails: { plotArea: 2, plotAreaUnit: "sq-yd" } })).toBe(18);
  });

  it("uses the smallest variant for builder listings", () => {
    const variants = [
      { size: 1200, sizeUnit: "sq-ft" },
      { size: 100, sizeUnit: "sq-m" },
    ];

    expect(deriveAreaSqft(flatRule, { variants })).toBe(1076.39);
  });

  it("returns null without any area", () => {
    expect(deriveAreaSqft(flatRule, { details: {} })).toBeNull();
  });
});

describe("derivePrice", () => {
  it("uses the sale price or monthly rent", () => {
    expect(derivePrice("sale", { pricing: { expectedPrice: 500 } })).toBe(500);
    expect(derivePrice("rent-lease", { pricing: { monthlyRent: 20 } })).toBe(20);
  });

  it("uses the lowest variant price when variants exist", () => {
    const variants = [{ price: 900 }, { price: 700 }, {}];

    expect(derivePrice("sale", { pricing: { expectedPrice: 1 }, variants })).toBe(700);
  });

  it("returns null without a price", () => {
    expect(derivePrice("sale", { pricing: {} })).toBeNull();
  });
});

describe("deriveVariantPriceRange", () => {
  it("returns the lowest and highest price", () => {
    expect(deriveVariantPriceRange([{ price: 5 }, { price: 9 }, { price: 7 }])).toEqual({ priceMin: 5, priceMax: 9 });
  });

  it("returns empty values without prices", () => {
    expect(deriveVariantPriceRange([{}])).toEqual({ priceMin: undefined, priceMax: undefined });
  });
});

describe("deriveTitle", () => {
  const base = { subTypeName: "Flat/Apartment", locality: "Vesu" };

  it("adds the BHK for residential listings", () => {
    expect(deriveTitle({ ...base, rule: flatRule, listing: { details: { bedrooms: 3 } } })).toBe(
      "3 BHK Flat/Apartment in Vesu"
    );
  });

  it("leaves the BHK out without bedrooms", () => {
    expect(deriveTitle({ ...base, rule: flatRule, listing: { details: {} } })).toBe("Flat/Apartment in Vesu");
  });

  it("uses the PG name for PG listings", () => {
    const rule = getRule("pg-co-living", "pg");

    expect(deriveTitle({ ...base, rule, listing: { details: { pgName: "Sunrise PG" } } })).toBe("Sunrise PG");
  });

  it("uses the project name for builder listings", () => {
    expect(deriveTitle({ ...base, rule: flatRule, listing: {}, projectName: "Green Heights" })).toBe(
      "Green Heights Flat/Apartment"
    );
  });

  it("trims long titles to 150 characters", () => {
    const title = deriveTitle({ ...base, rule: flatRule, listing: {}, locality: "x".repeat(300) });

    expect(title).toHaveLength(150);
  });
});
