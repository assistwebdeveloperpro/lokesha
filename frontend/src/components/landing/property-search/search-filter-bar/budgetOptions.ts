import type { RangeBounds } from "../searchFilterOptions";

const LAC = 100_000;
const CRORE = 10_000_000;

const SALE_LAC_STEPS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90];
const SALE_CRORE_STEPS = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.3, 2.6, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10];

const PG_RUPEE_STEPS = [
  1_000, 2_000, 3_000, 4_000, 5_000, 7_000, 10_000, 15_000, 20_000, 25_000,
  30_000, 40_000, 50_000, 75_000, 100_000,
];

const trimAmount = (value: number) => Number(value.toFixed(2)).toString();

export function formatBudgetOption(value: number, isPg: boolean): string {
  if (isPg || value < LAC) {
    return `₹ ${Math.round(value).toLocaleString("en-IN")}`;
  }
  if (value >= CRORE) return `₹ ${trimAmount(value / CRORE)} Cr`;
  return `₹ ${trimAmount(value / LAC)} Lac`;
}

export function budgetStepsFor(bounds: RangeBounds, isPg: boolean): number[] {
  const source = isPg
    ? PG_RUPEE_STEPS
    : [
        ...SALE_LAC_STEPS.map((step) => step * LAC),
        ...SALE_CRORE_STEPS.map((step) => Math.round(step * CRORE)),
      ];

  const steps = source.filter((step) => step >= bounds.min && step <= bounds.max);
  if (steps[0] !== bounds.min) steps.unshift(bounds.min);
  if (steps[steps.length - 1] !== bounds.max) steps.push(bounds.max);
  return steps;
}

export function budgetStepIndex(steps: number[], value: number): number {
  let index = 0;
  let best = Number.POSITIVE_INFINITY;
  steps.forEach((step, stepIndex) => {
    const diff = Math.abs(step - value);
    if (diff < best) {
      best = diff;
      index = stepIndex;
    }
  });
  return index;
}
