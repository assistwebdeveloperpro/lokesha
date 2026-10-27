import { describe, expect, it } from "vitest";
import { getDraftSubtitle, getDraftTitle, getResumeHref } from "./draftListLabels";

describe("getDraftTitle", () => {
  it("names the property type and sub types", () => {
    expect(
      getDraftTitle({ summary: { propertyType: "residential", subTypes: ["flat-apartment", "duplex", "ghost"] } }),
    ).toBe("Residential · Flat/Apartment, Duplex");
  });

  it("handles types without sub types", () => {
    expect(getDraftTitle({ summary: { propertyType: "pg-co-living", subTypes: [""] } })).toBe("PG/Co-Living");
  });

  it("falls back for a draft that has nothing yet", () => {
    expect(getDraftTitle({ summary: null })).toBe("Untitled draft");
    expect(getDraftTitle({ summary: {} })).toBe("Untitled draft");
  });
});

describe("getDraftSubtitle", () => {
  it("joins the listing type and locality", () => {
    expect(getDraftSubtitle({ summary: { listingType: "sale", locality: "Vesu" } })).toBe("Sale · Vesu");
  });

  it("skips what is missing", () => {
    expect(getDraftSubtitle({ summary: { listingType: "sale" } })).toBe("Sale");
    expect(getDraftSubtitle({ summary: null })).toBe("");
  });
});

describe("getResumeHref", () => {
  it("opens the saved step", () => {
    expect(getResumeHref({ id: "d1", currentStep: 3 })).toBe("/post-property?draft=d1&step=3");
  });

  it("leaves the first step out and keeps the step in range", () => {
    expect(getResumeHref({ id: "d1", currentStep: 1 })).toBe("/post-property?draft=d1");
    expect(getResumeHref({ id: "d1", currentStep: 99 })).toBe("/post-property?draft=d1&step=5");
    expect(getResumeHref({ id: "d1", currentStep: 0 })).toBe("/post-property?draft=d1");
  });
});
