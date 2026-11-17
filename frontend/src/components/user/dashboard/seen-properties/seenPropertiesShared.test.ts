import { describe, expect, it } from "vitest";
import { getLastPage, SEEN_PAGE_SIZE } from "./seenPropertiesShared";

describe("getLastPage", () => {
  it("rounds up to the page holding the last rows", () => {
    expect(getLastPage(SEEN_PAGE_SIZE + 1)).toBe(2);
  });

  it("never returns less than the first page", () => {
    expect(getLastPage(0)).toBe(1);
  });
});
