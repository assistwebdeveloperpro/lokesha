import { describe, expect, it } from "vitest";
import {
  appendSearchTag,
  createSearchTag,
  syncHeaderCityTag,
} from "./heroSearchTags";

describe("createSearchTag", () => {
  it("ignores blank input", () => {
    expect(createSearchTag("   ")).toBeNull();
  });

  it("detects known cities case-insensitively", () => {
    expect(createSearchTag("gandhinagar")).toEqual({
      kind: "city",
      label: "Gandhinagar",
    });
  });

  it("defaults other text to locality and honours an explicit kind", () => {
    expect(createSearchTag("Bopal")).toEqual({ kind: "locality", label: "Bopal" });
    expect(createSearchTag("Shyam Swastik", "project")).toEqual({
      kind: "project",
      label: "Shyam Swastik",
    });
  });
});

describe("appendSearchTag", () => {
  it("skips duplicates", () => {
    const tags = [{ kind: "locality" as const, label: "Bopal" }];
    expect(appendSearchTag(tags, { kind: "locality", label: "bopal" })).toEqual(tags);
  });

  it("replaces the existing city", () => {
    const tags = [
      { kind: "city" as const, label: "Ahmedabad" },
      { kind: "locality" as const, label: "Bopal" },
    ];
    expect(appendSearchTag(tags, { kind: "city", label: "Pune" })).toEqual([
      { kind: "city", label: "Pune" },
      { kind: "locality", label: "Bopal" },
    ]);
  });
});

describe("syncHeaderCityTag", () => {
  const tags = [
    { kind: "city" as const, label: "Ahmedabad" },
    { kind: "locality" as const, label: "Bopal" },
  ];

  it("swaps the city and keeps other tags", () => {
    expect(syncHeaderCityTag(tags, "Pune")).toEqual([
      { kind: "city", label: "Pune" },
      { kind: "locality", label: "Bopal" },
    ]);
  });

  it("drops the city for All India", () => {
    expect(syncHeaderCityTag(tags, null)).toEqual([
      { kind: "locality", label: "Bopal" },
    ]);
  });
});
