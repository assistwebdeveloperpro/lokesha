import { describe, expect, it } from "vitest";
import {
  countMoreFilterSelections,
  formatMoreFiltersToParams,
  parseMoreFiltersFromParams,
} from "./moreFiltersParam";
import { EMPTY_MORE_FILTERS } from "./moreFilters.types";

describe("moreFiltersParam", () => {
  it("round-trips list and flag params", () => {
    const more = {
      ...EMPTY_MORE_FILTERS,
      balconies: ["2"],
      facings: ["East"],
      priceNegotiable: true,
    };
    const params = formatMoreFiltersToParams(more);
    expect(parseMoreFiltersFromParams(params)).toEqual(more);
  });

  it("counts active selections", () => {
    expect(countMoreFilterSelections(EMPTY_MORE_FILTERS)).toBe(0);
    expect(
      countMoreFilterSelections({
        ...EMPTY_MORE_FILTERS,
        balconies: ["1", "2"],
        cornerPlot: true,
      }),
    ).toBe(3);
  });
});
