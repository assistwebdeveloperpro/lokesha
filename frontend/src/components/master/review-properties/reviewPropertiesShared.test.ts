import { describe, expect, it } from "vitest";
import { formatValue, humanizeKey, toDisplayEntries } from "./reviewPropertiesShared";

describe("humanizeKey", () => {
  it.each([
    ["carpetAreaUnit", "Carpet area unit"],
    ["bedrooms", "Bedrooms"],
    ["isFullHouse", "Is full house"],
  ])("%s -> %s", (key, label) => {
    expect(humanizeKey(key)).toBe(label);
  });
});

describe("formatValue", () => {
  it("formats booleans and lists", () => {
    expect(formatValue(true)).toBe("Yes");
    expect(formatValue(["a", "b"])).toBe("a, b");
    expect(formatValue(12)).toBe("12");
  });
});

describe("toDisplayEntries", () => {
  it("keeps real values and drops empty ones, false flags and nested objects", () => {
    const entries = toDisplayEntries({
      bedrooms: 3,
      carpetAreaUnit: "sq-ft",
      isFullHouse: true,
      hasPantry: false,
      note: "",
      missing: null,
      tags: [],
      list: ["x"],
      nested: { a: 1 },
    });

    expect(entries).toEqual([
      { label: "Bedrooms", value: "3" },
      { label: "Carpet area unit", value: "sq-ft" },
      { label: "Is full house", value: "Yes" },
      { label: "List", value: "x" },
    ]);
  });

  it("handles missing fields", () => {
    expect(toDisplayEntries(undefined)).toEqual([]);
  });
});
