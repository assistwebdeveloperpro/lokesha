import { describe, expect, it } from "vitest";
import {
  MAX_AMOUNT,
  MAX_NOTICE_PERIOD_MONTHS,
  isValidAmount,
  isValidNoticePeriod,
} from "./pricing.schema";

describe("isValidAmount", () => {
  it("accepts zero up to the backend maximum", () => {
    expect(isValidAmount(0)).toBe(true);
    expect(isValidAmount(2500000.5)).toBe(true);
    expect(isValidAmount(MAX_AMOUNT)).toBe(true);
  });

  it("rejects negative, oversized and non numeric amounts", () => {
    expect(isValidAmount(-1)).toBe(false);
    expect(isValidAmount(MAX_AMOUNT + 1)).toBe(false);
    expect(isValidAmount(Number.NaN)).toBe(false);
  });
});

describe("isValidNoticePeriod", () => {
  it("accepts whole months from 0 to the maximum", () => {
    expect(isValidNoticePeriod(0)).toBe(true);
    expect(isValidNoticePeriod(MAX_NOTICE_PERIOD_MONTHS)).toBe(true);
  });

  it("rejects fractions, negatives and values above the maximum", () => {
    expect(isValidNoticePeriod(1.5)).toBe(false);
    expect(isValidNoticePeriod(-1)).toBe(false);
    expect(isValidNoticePeriod(MAX_NOTICE_PERIOD_MONTHS + 1)).toBe(false);
  });
});
