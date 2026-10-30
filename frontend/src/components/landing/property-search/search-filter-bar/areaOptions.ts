import { AREA_RANGE } from "../../home/hero-banner/heroBanner.shared";
import type { RangeBounds } from "../searchFilterOptions";

const AREA_SQFT_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1_000, 1_200, 1_400, 1_600,
  1_800, 2_000, 2_200, 2_400, 2_600, 2_800, 3_000, 3_500, 4_000, 4_500, 5_000,
  6_000, 7_000, 8_000, 9_000, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000,
  50_000,
];

export function areaStepsFor(bounds: RangeBounds): number[] {
  const steps = AREA_SQFT_STEPS.filter(
    (step) => step >= bounds.min && step <= bounds.max,
  );
  if (steps[0] !== bounds.min) steps.unshift(bounds.min);
  if (steps[steps.length - 1] !== bounds.max) steps.push(bounds.max);
  return steps;
}

export const AREA_FILTER_STEPS = areaStepsFor(AREA_RANGE);
