import { describe, expect, it } from "vitest";
import { getRecentSearchesCountLabel } from "./recentSearchesShared";

describe("getRecentSearchesCountLabel", () => {
  it("wraps the total in brackets", () => {
    expect(getRecentSearchesCountLabel(8)).toBe("(8)");
    expect(getRecentSearchesCountLabel(0)).toBe("(0)");
  });
});
