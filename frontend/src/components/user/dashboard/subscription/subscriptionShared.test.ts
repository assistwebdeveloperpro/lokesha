import { describe, expect, it } from "vitest";
import type { PurchasablePackage } from "@/services/userSubscription.service";
import {
  calculatePreview,
  clampQuantity,
  formatCreditChange,
  formatDaysLeft,
  getInvoiceFileName,
  getListingChoices,
  getMonthChoices,
  isValidGstin,
  plural,
} from "./subscriptionShared";

const standard: PurchasablePackage = {
  id: "pkg-std",
  code: "standard",
  name: "Standard",
  displayTitle: "Standard Package",
  description: "",
  benefits: [],
  pricePerListingMonth: 100000,
  gstPercent: 18,
  minListings: 1,
  maxListings: 50,
  minMonths: 1,
  maxMonths: 12,
  allowCustomQuantity: true,
  allowCustomDuration: true,
};

describe("calculatePreview", () => {
  it.each([
    [1, 1, 100000, 18000, 118000],
    [2, 1, 200000, 36000, 236000],
    [2, 2, 400000, 72000, 472000],
    [3, 2, 600000, 108000, 708000],
    [2, 3, 600000, 108000, 708000],
  ])("prices %i listing(s) for %i month(s) like the server", (listings, months, baseAmount, gstAmount, totalAmount) => {
    expect(calculatePreview(standard, listings, months)).toEqual({ baseAmount, gstAmount, totalAmount });
  });

  it("rounds GST to the nearest paisa", () => {
    expect(calculatePreview({ ...standard, pricePerListingMonth: 1050 }, 1, 1).gstAmount).toBe(189);
  });
});

describe("choices", () => {
  it("clamps a typed quantity into the allowed range", () => {
    expect(clampQuantity(99, 1, 50)).toBe(50);
    expect(clampQuantity(0, 1, 50)).toBe(1);
    expect(clampQuantity(2.9, 1, 50)).toBe(2);
    expect(clampQuantity(Number.NaN, 1, 50)).toBe(1);
  });

  it("allows the full range only when custom choices are on", () => {
    expect(getListingChoices(standard)).toEqual({ min: 1, max: 50 });
    expect(getMonthChoices(standard)).toEqual({ min: 1, max: 12 });

    const fixed = { ...standard, allowCustomQuantity: false, allowCustomDuration: false, minListings: 2, minMonths: 3 };
    expect(getListingChoices(fixed)).toEqual({ min: 2, max: 2 });
    expect(getMonthChoices(fixed)).toEqual({ min: 3, max: 3 });
  });
});

describe("text helpers", () => {
  it("pluralises", () => {
    expect(plural(1, "listing")).toBe("1 listing");
    expect(plural(2, "listing")).toBe("2 listings");
    expect(plural(0, "day")).toBe("0 days");
  });

  it("describes the days left", () => {
    expect(formatDaysLeft(null)).toBe("No end date");
    expect(formatDaysLeft(0)).toBe("Ends today");
    expect(formatDaysLeft(1)).toBe("1 day left");
    expect(formatDaysLeft(7)).toBe("7 days left");
  });

  it("signs credit changes", () => {
    expect(formatCreditChange(2)).toBe("+2");
    expect(formatCreditChange(-1)).toBe("-1");
  });

  it("makes a safe invoice file name", () => {
    expect(getInvoiceFileName("LOK/2026-27/000123")).toBe("Invoice-LOK-2026-27-000123.pdf");
  });

  it("checks the GSTIN format", () => {
    expect(isValidGstin("24AAACC1206D1ZM")).toBe(true);
    expect(isValidGstin("24aaacc1206d1zm")).toBe(false);
    expect(isValidGstin("12345")).toBe(false);
  });
});
