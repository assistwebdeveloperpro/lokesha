import { describe, expect, it } from "vitest";
import { resolveCarParkingLabel } from "./propertyDetailsCarParking";

describe("resolveCarParkingLabel", () => {
  it("reads parking from builder variant charges instead of the listing default", () => {
    expect(
      resolveCarParkingLabel({
        attributeCount: 0,
        listingCount: 0,
        variants: [
          { charges: { carParkingAvailable: true, carParkingCount: 2 } },
          { charges: { carParkingAvailable: true, carParkingCount: 1 } },
        ],
      }),
    ).toBe("1–2 car parking spaces (varies by configuration)");
  });

  it("formats a single non-builder parking count", () => {
    expect(resolveCarParkingLabel({ attributeCount: 2 })).toBe("2 car parking spaces");
  });

  it("hides parking when nothing is configured", () => {
    expect(resolveCarParkingLabel({ attributeCount: null, listingCount: null })).toBeNull();
  });
});
