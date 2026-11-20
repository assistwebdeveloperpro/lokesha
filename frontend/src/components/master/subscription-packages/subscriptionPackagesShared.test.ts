import { describe, expect, it } from "vitest";
import type { SubscriptionPackage } from "@/services/adminSubscription.service";
import { formatRupees } from "@/lib/currency";
import {
  buildUpdateInput,
  formatChangeValue,
  rupeesToPaise,
  toFormState,
  validatePackageForm,
} from "./subscriptionPackagesShared";

const standard: SubscriptionPackage = {
  id: "pkg-std",
  code: "standard",
  name: "Standard",
  displayTitle: "Standard Package",
  description: "Pick what you need.",
  benefits: ["Unlimited leads"],
  status: "active",
  displayOrder: 2,
  pricePerListingMonth: 100000,
  gstPercent: 18,
  minListings: 1,
  maxListings: 50,
  minMonths: 1,
  maxMonths: 12,
  allowCustomQuantity: true,
  allowCustomDuration: true,
  freeCredits: null,
  freeLeadLimit: null,
  freePropertyValidityDays: null,
  createdAt: "2026-11-20T00:00:00.000Z",
  updatedAt: "2026-11-20T00:00:00.000Z",
};

const free: SubscriptionPackage = {
  ...standard,
  id: "pkg-free",
  code: "free",
  name: "Free",
  pricePerListingMonth: 0,
  gstPercent: 0,
  maxListings: 1,
  maxMonths: 1,
  allowCustomQuantity: false,
  allowCustomDuration: false,
  freeCredits: 2,
  freeLeadLimit: 2,
  freePropertyValidityDays: 30,
};

describe("money helpers", () => {
  it("formats paise as rupees with Indian grouping", () => {
    expect(formatRupees(100000)).toBe("₹1,000");
    expect(formatRupees(118050)).toBe("₹1,180.5");
    expect(formatRupees(0)).toBe("₹0");
    expect(formatRupees(12345600)).toBe("₹1,23,456");
  });

  it("converts typed rupees to whole paise without float drift", () => {
    expect(rupeesToPaise("1000")).toBe(100000);
    expect(rupeesToPaise("1500.5")).toBe(150050);
    expect(rupeesToPaise("0.29")).toBe(29);
    expect(rupeesToPaise("")).toBeNull();
    expect(rupeesToPaise("abc")).toBeNull();
  });
});

describe("validatePackageForm", () => {
  it("accepts the stored values of both packages", () => {
    expect(validatePackageForm(toFormState(standard), false)).toEqual({});
    expect(validatePackageForm(toFormState(free), true)).toEqual({});
  });

  it("flags empty text, blank benefit points and a missing price", () => {
    const form = { ...toFormState(standard), name: " ", displayTitle: "", benefits: ["ok", " "], price: "" };

    expect(validatePackageForm(form, false)).toMatchObject({
      name: expect.any(String),
      displayTitle: expect.any(String),
      benefits: expect.any(String),
      price: expect.any(String),
    });
  });

  it("flags ranges and bounds on the paid package", () => {
    const form = { ...toFormState(standard), minListings: "10", maxListings: "5", gstPercent: "120", maxMonths: "0" };
    const errors = validatePackageForm(form, false);

    expect(errors.maxListings).toBe("Maximum listings cannot be less than minimum");
    expect(errors.gstPercent).toBeDefined();
    expect(errors.maxMonths).toBeDefined();
  });

  it("checks only the free-grant settings on the Free package", () => {
    const form = { ...toFormState(free), freeCredits: "0", freeLeadLimit: "1.5", price: "bad" };
    const errors = validatePackageForm(form, true);

    expect(errors.freeCredits).toBeDefined();
    expect(errors.freeLeadLimit).toBeDefined();
    expect(errors.price).toBeUndefined();
  });
});

describe("buildUpdateInput", () => {
  it("sends nothing when the form is unchanged", () => {
    expect(buildUpdateInput(standard, toFormState(standard))).toEqual({});
    expect(buildUpdateInput(free, toFormState(free))).toEqual({});
  });

  it("sends only the changed fields, with the price in paise", () => {
    const form = { ...toFormState(standard), price: "1500", name: " Standard Plus ", maxListings: "60" };

    expect(buildUpdateInput(standard, form)).toEqual({
      name: "Standard Plus",
      pricePerListingMonth: 150000,
      maxListings: 60,
    });
  });

  it("detects a changed benefit list and a status change", () => {
    const form = { ...toFormState(standard), benefits: ["Unlimited leads", "Priority support"], status: "inactive" as const };

    expect(buildUpdateInput(standard, form)).toEqual({
      benefits: ["Unlimited leads", "Priority support"],
      status: "inactive",
    });
  });

  it("never sends paid-only fields for the Free package", () => {
    const form = { ...toFormState(free), freeCredits: "3", price: "999", gstPercent: "5" };

    expect(buildUpdateInput(free, form)).toEqual({ freeCredits: 3 });
  });
});

describe("formatChangeValue", () => {
  it.each([
    ["pricePerListingMonth", 150000, "₹1,500"],
    ["gstPercent", 18, "18%"],
    ["freePropertyValidityDays", 30, "30 days"],
    ["allowCustomQuantity", true, "Yes"],
    ["status", "inactive", "Inactive"],
    ["benefits", ["A", "B"], "A • B"],
    ["benefits", [], "—"],
    ["freeLeadLimit", null, "—"],
    ["name", "Standard", "Standard"],
  ])("formats %s %j as %s", (field, value, expected) => {
    expect(formatChangeValue(field, value)).toBe(expected);
  });
});
