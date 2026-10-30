import { describe, expect, it } from "vitest";
import { AREA_RANGE } from "../../home/hero-banner/heroBanner.shared";
import { areaStepsFor } from "./areaOptions";

describe("areaStepsFor", () => {
  it("starts at 100 sq ft and ends at the area ceiling", () => {
    const steps = areaStepsFor(AREA_RANGE);
    expect(steps[0]).toBe(100);
    expect(steps).toContain(1_000);
    expect(steps).toContain(5_000);
    expect(steps.at(-1)).toBe(AREA_RANGE.max);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });
});
