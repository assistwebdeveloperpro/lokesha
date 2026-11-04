import { describe, expect, it } from "vitest";
import { formatProjectAvgPrice } from "./buildPropertyDetailsView";

describe("formatProjectAvgPrice", () => {
  it("formats a square-yard rate", () => {
    expect(formatProjectAvgPrice(32500, "sq-yd")).toBe("₹32,500 / SqYd");
  });

  it("accepts the form unit label and decimal amounts", () => {
    expect(formatProjectAvgPrice("32500.00", "sq yd")).toBe("₹32,500 / SqYd");
    expect(formatProjectAvgPrice(4800, "sq-ft")).toBe("₹4,800 / SqFt");
  });

  it("returns nothing when the property type has no average price", () => {
    expect(formatProjectAvgPrice(null, "sq-yd")).toBeNull();
    expect(formatProjectAvgPrice("", "sq-yd")).toBeNull();
    expect(formatProjectAvgPrice(0, "sq-yd")).toBeNull();
  });
});
