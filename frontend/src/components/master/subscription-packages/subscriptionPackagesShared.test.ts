import { describe, expect, it } from "vitest";
import type { SubscriptionPackage } from "@/services/adminSubscription.service";
import { formatRupees } from "@/lib/currency";
import {
  buildUpdateInput,
  formatChangeValue,
  parseRupees,
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
  pricePerListingMonth: 1000,
  pricePerLead: null,
  gstPercent: 18,
  minLeads: null,
  maxLeads: null,
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

const leads: SubscriptionPackage = {
  ...standard,
  id: "pkg-leads",
  code: "leads",
  name: "Buy More Leads",
  displayOrder: 3,
  pricePerListingMonth: 0,
  pricePerLead: 100,
  minLeads: 1,
  maxLeads: 100,
  maxListings: 1,
  maxMonths: 1,
  allowCustomQuantity: false,
  allowCustomDuration: false,
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
  it("formats rupees with Indian grouping", () => {
    expect(formatRupees(1000)).toBe("₹1,000");
    expect(formatRupees(1180.5)).toBe("₹1,180.5");
    expect(formatRupees(0)).toBe("₹0");
    expect(formatRupees(123456)).toBe("₹1,23,456");
  });

  it("parses typed rupees as whole numbers only", () => {
    expect(parseRupees("1000")).toBe(1000);
    expect(parseRupees("1500.5")).toBeNull();
    expect(parseRupees("")).toBeNull();
    expect(parseRupees("abc")).toBeNull();
  });
});

describe("validatePackageForm", () => {
  it("accepts the stored values of every package", () => {
    expect(validatePackageForm(toFormState(standard), "standard")).toEqual({});
    expect(validatePackageForm(toFormState(free), "free")).toEqual({});
    expect(validatePackageForm(toFormState(leads), "leads")).toEqual({});
  });

  it("flags empty text, blank benefit points and a missing price", () => {
    const form = { ...toFormState(standard), name: " ", displayTitle: "", benefits: ["ok", " "], price: "" };

    expect(validatePackageForm(form, "standard")).toMatchObject({
      name: expect.any(String),
      displayTitle: expect.any(String),
      benefits: expect.any(String),
      price: expect.any(String),
    });
  });

  it("flags ranges and bounds on the paid package", () => {
    const form = { ...toFormState(standard), minListings: "10", maxListings: "5", gstPercent: "120", maxMonths: "0" };
    const errors = validatePackageForm(form, "standard");

    expect(errors.maxListings).toBe("Maximum listings cannot be less than minimum");
    expect(errors.gstPercent).toBeDefined();
    expect(errors.maxMonths).toBeDefined();
  });

  it("checks only the free-grant settings on the Free package", () => {
    const form = { ...toFormState(free), freeCredits: "0", freeLeadLimit: "1.5", price: "bad" };
    const errors = validatePackageForm(form, "free");

    expect(errors.freeCredits).toBeDefined();
    expect(errors.freeLeadLimit).toBeDefined();
    expect(errors.price).toBeUndefined();
  });

  it("checks the price per lead, GST and lead range on the Buy More Leads package", () => {
    const form = { ...toFormState(leads), pricePerLead: "10.5", gstPercent: "120", minLeads: "20", maxLeads: "5" };
    const errors = validatePackageForm(form, "leads");

    expect(errors.pricePerLead).toBeDefined();
    expect(errors.gstPercent).toBeDefined();
    expect(errors.maxLeads).toBe("Maximum leads cannot be less than minimum");
  });

  it("ignores listing and month fields on the Buy More Leads package", () => {
    const form = { ...toFormState(leads), price: "bad", minListings: "", maxMonths: "0" };

    expect(validatePackageForm(form, "leads")).toEqual({});
  });

  it("rejects a lead price that is missing or above the limit", () => {
    expect(validatePackageForm({ ...toFormState(leads), pricePerLead: "" }, "leads").pricePerLead).toBeDefined();
    expect(validatePackageForm({ ...toFormState(leads), pricePerLead: "100001" }, "leads").pricePerLead).toBeDefined();
    expect(validatePackageForm({ ...toFormState(leads), pricePerLead: "0" }, "leads").pricePerLead).toBeUndefined();
  });
});

describe("buildUpdateInput", () => {
  it("sends nothing when the form is unchanged", () => {
    expect(buildUpdateInput(standard, toFormState(standard))).toEqual({});
    expect(buildUpdateInput(free, toFormState(free))).toEqual({});
    expect(buildUpdateInput(leads, toFormState(leads))).toEqual({});
  });

  it("sends only the lead-pack fields, never listing or month settings", () => {
    const form = { ...toFormState(leads), pricePerLead: "120", maxLeads: "50", price: "999", minListings: "9" };

    expect(buildUpdateInput(leads, form)).toEqual({ pricePerLead: 120, maxLeads: 50 });
  });

  it("sends only the changed fields, with the price in rupees", () => {
    const form = { ...toFormState(standard), price: "1500", name: " Standard Plus ", maxListings: "60" };

    expect(buildUpdateInput(standard, form)).toEqual({
      name: "Standard Plus",
      pricePerListingMonth: 1500,
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
    ["pricePerListingMonth", 1500, "₹1,500"],
    ["pricePerLead", 100, "₹100"],
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
