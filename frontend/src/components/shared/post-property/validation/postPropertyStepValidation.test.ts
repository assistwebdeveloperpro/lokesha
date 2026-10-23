import { describe, expect, it } from "vitest";
import { resolveFirstInvalidStep } from "./postPropertyStepValidation";

const clean = {
  address: {},
  details: {},
  amenities: {},
  pricing: {},
  photos: "",
  builder: {},
  tabs: null,
};

describe("resolveFirstInvalidStep", () => {
  it("returns null when every step passes", () => {
    expect(resolveFirstInvalidStep(clean)).toBeNull();
  });

  it.each([
    ["address", { address: { locality: "Required" } }, 1],
    ["details", { details: { bedrooms: "Required" } }, 2],
    ["project type", { builder: { projectType: "Required" } }, 2],
    ["amenities", { amenities: { facing: "Required" } }, 3],
    ["photos", { photos: "Please add at least one photo" }, 4],
    ["pricing", { pricing: { expectedPrice: "Required" } }, 5],
    ["assured return", { builder: { assuredReturn: "Out of range" } }, 5],
  ])("maps %s errors to the right step", (_label, errors, step) => {
    expect(resolveFirstInvalidStep({ ...clean, ...errors })).toBe(step);
  });

  it("maps sub type tab errors to their steps", () => {
    const tabs = { details: false, amenities: false, photos: false, pricing: false };

    expect(resolveFirstInvalidStep({ ...clean, tabs: { ...tabs, details: true } })).toBe(2);
    expect(resolveFirstInvalidStep({ ...clean, tabs: { ...tabs, amenities: true } })).toBe(3);
    expect(resolveFirstInvalidStep({ ...clean, tabs: { ...tabs, photos: true } })).toBe(4);
    expect(resolveFirstInvalidStep({ ...clean, tabs: { ...tabs, pricing: true } })).toBe(5);
  });

  it("reports the earliest step when several fail", () => {
    const step = resolveFirstInvalidStep({
      ...clean,
      pricing: { expectedPrice: "Required" },
      amenities: { facing: "Required" },
    });

    expect(step).toBe(3);
  });
});
