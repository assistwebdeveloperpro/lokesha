import { describe, expect, it } from "vitest";
import { toWholeNumber, validateExtend, validateGift, validateReason, validateRefund } from "./subscriptionActionsShared";

describe("validateReason", () => {
  it("accepts a reason of five to five hundred characters, ignoring surrounding spaces", () => {
    expect(validateReason("Goodwill")).toBe("");
    expect(validateReason("x".repeat(500))).toBe("");
    expect(validateReason(`  ${"x".repeat(5)}  `)).toBe("");
  });

  it.each([
    ["", "Please give a reason for this action"],
    ["    ", "Please give a reason for this action"],
    ["no", "Reason must be at least 5 characters"],
    ["x".repeat(501), "Reason must be 500 characters or fewer"],
  ])("rejects %j", (reason, message) => {
    expect(validateReason(reason)).toBe(message);
  });
});

describe("validateGift", () => {
  it("accepts valid values", () => {
    expect(validateGift({ credits: "3", months: "2", reason: "Goodwill" })).toEqual({});
  });

  it.each([
    [{ credits: "", months: "2", reason: "Goodwill" }, "credits"],
    [{ credits: "0", months: "2", reason: "Goodwill" }, "credits"],
    [{ credits: "1001", months: "2", reason: "Goodwill" }, "credits"],
    [{ credits: "1.5", months: "2", reason: "Goodwill" }, "credits"],
    [{ credits: "abc", months: "2", reason: "Goodwill" }, "credits"],
    [{ credits: "3", months: "0", reason: "Goodwill" }, "months"],
    [{ credits: "3", months: "61", reason: "Goodwill" }, "months"],
    [{ credits: "3", months: "2", reason: "" }, "reason"],
  ])("flags %j on %s only", (form, field) => {
    expect(Object.keys(validateGift(form))).toEqual([field]);
  });

  it("reports every problem at once", () => {
    expect(Object.keys(validateGift({ credits: "", months: "", reason: "" }))).toEqual(["credits", "months", "reason"]);
  });
});

describe("validateExtend and validateRefund", () => {
  it("check the months and the reason", () => {
    expect(validateExtend({ months: "1", reason: "Promotion" })).toEqual({});
    expect(Object.keys(validateExtend({ months: "0", reason: "no" }))).toEqual(["months", "reason"]);
  });

  it("needs only a reason to refund", () => {
    expect(validateRefund({ reason: "Duplicate purchase" })).toEqual({});
    expect(Object.keys(validateRefund({ reason: "" }))).toEqual(["reason"]);
  });
});

describe("toWholeNumber", () => {
  it("reads a whole number and falls back to zero", () => {
    expect(toWholeNumber(" 12 ")).toBe(12);
    expect(toWholeNumber("1.5")).toBe(0);
    expect(toWholeNumber("")).toBe(0);
  });
});
