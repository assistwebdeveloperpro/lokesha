import { describe, expect, it } from "vitest";
import { formatPropertyConfigurationLabel } from "./propertyDetailsConfigurationLabel";

describe("formatPropertyConfigurationLabel", () => {
  it("groups BHK numbers that share a unit type", () => {
    expect(
      formatPropertyConfigurationLabel(["2 BHK Flat/Apartment", "3 BHK Flat/Apartment"]),
    ).toBe("2, 3 BHK Flat/Apartment");
  });

  it("keeps distinct unit types separate", () => {
    expect(
      formatPropertyConfigurationLabel([
        "2 BHK Flat/Apartment",
        "3 BHK Flat/Apartment",
        "4 BHK Villa",
      ]),
    ).toBe("2, 3 BHK Flat/Apartment, 4 BHK Villa");
  });

  it("keeps 6+ BHK labels", () => {
    expect(formatPropertyConfigurationLabel(["6+ BHK Duplex"])).toBe("6+ BHK Duplex");
  });
});
