import { describe, expect, it } from "vitest";
import { CONTACTED_EMPTY_STATES, CONTACTED_TABS } from "./contactedPropertiesShared";

describe("contacted properties config", () => {
  it("offers the all, available and unavailable tabs", () => {
    expect(CONTACTED_TABS.map((tab) => tab.value)).toEqual(["all", "available", "unavailable"]);
  });

  it("has an empty state for the unfiltered and filtered views", () => {
    expect(Object.keys(CONTACTED_EMPTY_STATES)).toEqual(["all", "filtered"]);
  });
});
