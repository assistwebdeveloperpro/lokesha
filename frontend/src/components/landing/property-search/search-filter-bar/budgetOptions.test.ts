import { describe, expect, it } from "vitest";
import { DEFAULT_BUDGET, PG_BUDGET } from "../../home/hero-banner/heroBanner.shared";
import { budgetStepIndex, budgetStepsFor, formatBudgetOption } from "./budgetOptions";

describe("formatBudgetOption", () => {
  it("labels sale amounts like the budget dropdown", () => {
    expect(formatBudgetOption(500_000, false)).toBe("₹ 5 Lac");
    expect(formatBudgetOption(4_000_000, false)).toBe("₹ 40 Lac");
    expect(formatBudgetOption(12_000_000, false)).toBe("₹ 1.2 Cr");
    expect(formatBudgetOption(100_000_000, false)).toBe("₹ 10 Cr");
  });

  it("labels pg amounts in rupees", () => {
    expect(formatBudgetOption(5_000, true)).toBe("₹ 5,000");
    expect(formatBudgetOption(100_000, true)).toBe("₹ 1,00,000");
  });
});

describe("budgetStepsFor", () => {
  it("starts at 5 Lac and ends at the sale ceiling", () => {
    const steps = budgetStepsFor(DEFAULT_BUDGET, false);
    expect(steps[0]).toBe(500_000);
    expect(steps).toContain(4_000_000);
    expect(steps.at(-1)).toBe(DEFAULT_BUDGET.max);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });

  it("keeps pg steps inside the pg range", () => {
    const steps = budgetStepsFor(PG_BUDGET, true);
    expect(steps[0]).toBe(PG_BUDGET.min);
    expect(steps.at(-1)).toBe(PG_BUDGET.max);
    expect(steps.every((step) => step >= PG_BUDGET.min && step <= PG_BUDGET.max)).toBe(
      true,
    );
  });
});

describe("budgetStepIndex", () => {
  it("snaps to the nearest step", () => {
    const steps = budgetStepsFor(DEFAULT_BUDGET, false);
    expect(steps[budgetStepIndex(steps, 500_000)]).toBe(500_000);
    expect(steps[budgetStepIndex(steps, 1_200_000)]).toBe(1_000_000);
    expect(steps[budgetStepIndex(steps, 11_000_000)]).toBe(10_000_000);
  });
});
