import { describe, expect, it } from "vitest";
import {
  getHighlightLeadId,
  getLeadsHref,
  getPhoneStatusLabel,
  LEADS_PAGE_SIZE,
  LEADS_PATH,
  LEADS_TABLE_COLUMNS,
} from "./leadsShared";

describe("getLeadsHref", () => {
  it("adds the lead to the url", () => {
    expect(getLeadsHref("lead-1")).toBe(`${LEADS_PATH}?lead=lead-1`);
  });

  it("falls back to the plain leads page", () => {
    expect(getLeadsHref()).toBe(LEADS_PATH);
    expect(getLeadsHref(null)).toBe(LEADS_PATH);
  });
});

describe("getHighlightLeadId", () => {
  it("returns a single lead id", () => {
    expect(getHighlightLeadId({ lead: "lead-1" })).toBe("lead-1");
  });

  it("ignores a missing, empty or repeated param", () => {
    expect(getHighlightLeadId({})).toBeNull();
    expect(getHighlightLeadId({ lead: "" })).toBeNull();
    expect(getHighlightLeadId({ lead: ["a", "b"] })).toBeNull();
  });
});

describe("getPhoneStatusLabel", () => {
  it("says whether the lister's number was shared with the enquirer", () => {
    expect(getPhoneStatusLabel(true)).toBe("Your number shared");
    expect(getPhoneStatusLabel(false)).toBe("Your number hidden");
  });
});

describe("leads table config", () => {
  it("keeps the agreed columns and page size", () => {
    expect(LEADS_TABLE_COLUMNS).toEqual([
      "Property Details",
      "Price & Area",
      "Enquirer Details",
      "Enquiry Date",
      "Enquiry Details",
      "Action",
    ]);
    expect(LEADS_PAGE_SIZE).toBe(10);
  });
});
