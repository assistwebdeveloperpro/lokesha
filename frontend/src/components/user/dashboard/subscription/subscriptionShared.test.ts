import { describe, expect, it } from "vitest";
import type { PurchasablePackage } from "@/services/userSubscription.service";
import {
  calculatePreview,
  canBuyMoreLeads,
  clampQuantity,
  describeOrderQuantity,
  formatCreditChange,
  formatDaysLeft,
  formatLeadPrice,
  getInvoiceFileName,
  getLeadChoices,
  getListingChoices,
  getMonthChoices,
  getOrderTitle,
  getPayLabel,
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
  pricePerLead: null,
  minLeads: null,
  maxLeads: null,
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

describe("lead pack helpers", () => {
  const leadPack: PurchasablePackage = { ...standard, id: "pkg-leads", code: "leads", pricePerLead: 100, minLeads: 1, maxLeads: 100 };

  it("takes the quantity range from the package", () => {
    expect(getLeadChoices(leadPack)).toEqual({ min: 1, max: 100 });
    expect(getLeadChoices({ ...leadPack, minLeads: 5, maxLeads: 20 })).toEqual({ min: 5, max: 20 });
  });

  it("collapses to one lead when the package range is not set up", () => {
    expect(getLeadChoices({ ...leadPack, minLeads: null, maxLeads: null })).toEqual({ min: 1, max: 1 });
    expect(getLeadChoices({ ...leadPack, minLeads: 5, maxLeads: 2 })).toEqual({ min: 5, max: 5 });
  });

  it("labels the price per lead", () => {
    expect(formatLeadPrice(leadPack)).toBe("₹100 per lead");
    expect(formatLeadPrice({ ...leadPack, pricePerLead: null })).toBe("");
  });

  it("offers more leads only for a live property that used its limit", () => {
    expect(canBuyMoreLeads({ status: "published", isLimitReached: true })).toBe(true);
    expect(canBuyMoreLeads({ status: "published", isLimitReached: false })).toBe(false);
    expect(canBuyMoreLeads({ status: "closed", isLimitReached: true })).toBe(false);
  });

  it("labels the pay button by phase", () => {
    expect(getPayLabel("idle", 1180)).toBe("Pay ₹1,180");
    expect(getPayLabel("quoting", 1180)).toBe("Pay ₹1,180");
    expect(getPayLabel("paying", 1180)).toBe("Opening payment...");
    expect(getPayLabel("verifying", 1180)).toBe("Confirming payment...");
  });

  it("describes what an order bought", () => {
    const base = { listings: null, months: null, leads: null, property: null };

    expect(describeOrderQuantity({ ...base, orderType: "subscription", listings: 2, months: 3 })).toBe("2 listings · 3 months");
    expect(describeOrderQuantity({ ...base, orderType: "lead_pack", leads: 10, property: { title: "Sky Heights" } })).toBe(
      "10 leads · Sky Heights",
    );
    expect(describeOrderQuantity({ ...base, orderType: "lead_pack", leads: 1 })).toBe("1 lead");
    expect(getOrderTitle("lead_pack")).toBe("Extra leads");
    expect(getOrderTitle("subscription")).toBe("Standard package");
  });
});
