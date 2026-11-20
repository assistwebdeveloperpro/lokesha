const { calculatePrice } = require("./subscription-pricing.util");

const PRICE = { pricePerListingMonth: 100000, gstPercent: 18 };

describe("calculatePrice", () => {
  it.each([
    [1, 1, 100000, 18000, 118000],
    [2, 1, 200000, 36000, 236000],
    [2, 2, 400000, 72000, 472000],
    [3, 2, 600000, 108000, 708000],
    [2, 3, 600000, 108000, 708000],
  ])("prices %i listing(s) for %i month(s)", (listings, months, baseAmount, gstAmount, totalAmount) => {
    expect(calculatePrice({ listings, months, ...PRICE })).toEqual({ baseAmount, gstAmount, totalAmount });
  });

  it("rounds GST half up to the nearest unit", () => {
    const result = calculatePrice({ listings: 1, months: 1, pricePerListingMonth: 1050, gstPercent: 18 });
    expect(result).toEqual({ baseAmount: 1050, gstAmount: 189, totalAmount: 1239 });

    const half = calculatePrice({ listings: 1, months: 1, pricePerListingMonth: 25, gstPercent: 18 });
    expect(half.gstAmount).toBe(5);
  });

  it("charges no GST when the rate is zero", () => {
    expect(calculatePrice({ listings: 3, months: 1, pricePerListingMonth: 100000, gstPercent: 0 }).totalAmount).toBe(300000);
  });

  it.each([
    [{ listings: 0, months: 1 }],
    [{ listings: 1, months: 0 }],
    [{ listings: 1.5, months: 1 }],
    [{ listings: -1, months: 1 }],
    [{ listings: "2", months: 1 }],
  ])("rejects invalid quantity %j", (input) => {
    expect(() => calculatePrice({ ...input, ...PRICE })).toThrow(RangeError);
  });

  it("rejects an invalid price or GST rate", () => {
    expect(() => calculatePrice({ listings: 1, months: 1, pricePerListingMonth: 10.5, gstPercent: 18 })).toThrow(RangeError);
    expect(() => calculatePrice({ listings: 1, months: 1, pricePerListingMonth: -1, gstPercent: 18 })).toThrow(RangeError);
    expect(() => calculatePrice({ listings: 1, months: 1, pricePerListingMonth: 100, gstPercent: -5 })).toThrow(RangeError);
  });
});
