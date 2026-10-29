import { describe, expect, it } from "vitest";
import { formatBudgetParam, parseBudgetParam } from "./budgetParam";

describe("formatBudgetParam", () => {
  it("formats lacs and crores", () => {
    expect(formatBudgetParam(500_000)).toBe("5-Lacs");
    expect(formatBudgetParam(30_000_000)).toBe("3-Crores");
  });

  it("keeps fractions and switches to crores at 100 lacs", () => {
    expect(formatBudgetParam(7_550_000)).toBe("75.5-Lacs");
    expect(formatBudgetParam(10_000_000)).toBe("1-Crores");
    expect(formatBudgetParam(15_000_000)).toBe("1.5-Crores");
  });

  it("falls back to plain rupees below one lac", () => {
    expect(formatBudgetParam(50_000)).toBe("50000");
  });
});

describe("parseBudgetParam", () => {
  it("round-trips formatted values", () => {
    for (const rupees of [500_000, 7_550_000, 30_000_000, 100_000_000]) {
      expect(parseBudgetParam(formatBudgetParam(rupees))).toBe(rupees);
    }
  });

  it("accepts plain numbers and unit spellings", () => {
    expect(parseBudgetParam("750000")).toBe(750_000);
    expect(parseBudgetParam("2-lakh")).toBe(200_000);
    expect(parseBudgetParam("1-Crore")).toBe(10_000_000);
  });

  it("rejects invalid values", () => {
    expect(parseBudgetParam("cheap")).toBeUndefined();
    expect(parseBudgetParam("")).toBeUndefined();
  });
});
