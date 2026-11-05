import { describe, expect, it } from "vitest";
import {
  createAvailableSizeRow,
  type AvailableSizeRow,
} from "@/components/master/post-property/postPropertyProjectDetails";
import {
  getAvailableSizeLabel,
  getAvailableSizeLabels,
  getBhkAreaTabDisplayLabel,
  getBhkAreaTabKey,
  getBhkAreaTabs,
  lookupBhkCarParking,
  lookupBhkCharges,
} from "./bhkAreaDetails";
import {
  EMPTY_BHK_CAR_PARKING,
  EMPTY_BHK_CHARGES,
} from "@/components/master/post-property/postPropertyProjectDetails";
import type { ProjectDetailsValues } from "@/components/master/post-property/postPropertyProjectDetails";

function row(
  patch: Partial<AvailableSizeRow> & Pick<AvailableSizeRow, "id">,
): AvailableSizeRow {
  return { ...createAvailableSizeRow("Bunglow"), ...patch };
}

describe("getAvailableSizeLabel", () => {
  it("uses the base BHK + unit type label when each combination is unique", () => {
    const rows = [
      row({ id: "a", bhk: "2 BHK", unitType: "Flat/Apartment" }),
      row({ id: "b", bhk: "3 BHK", unitType: "Flat/Apartment" }),
    ];

    expect(getAvailableSizeLabels(rows)).toEqual([
      "2 BHK Flat/Apartment",
      "3 BHK Flat/Apartment",
    ]);
  });

  it("uses a size suffix on area tab labels when the same BHK + unit type repeats", () => {
    const rows = [
      row({ id: "a", bhk: "4 BHK", unitType: "Bungalow/Villa", size: "2500", sizeUnit: "sq ft" }),
      row({ id: "b", bhk: "4 BHK", unitType: "Bungalow/Villa", size: "3200", sizeUnit: "sq ft" }),
    ];

    expect(getBhkAreaTabDisplayLabel(rows[0], rows)).toBe("4 BHK (2500 sq ft)");
    expect(getBhkAreaTabDisplayLabel(rows[1], rows)).toBe("4 BHK (3200 sq ft)");
  });

  it("matches the area tab key used when the same BHK + unit type is listed more than once", () => {
    const rows = [
      row({ id: "a", bhk: "4 BHK", unitType: "Bungalow/Villa", size: "2500", sizeUnit: "sq ft" }),
      row({ id: "b", bhk: "4 BHK", unitType: "Bungalow/Villa", size: "3200", sizeUnit: "sq ft" }),
    ];

    expect(getBhkAreaTabKey(rows[0], rows)).toBe("4 BHK Bungalow/Villa (2500 sq ft)");
    expect(getBhkAreaTabKey(rows[1], rows)).toBe("4 BHK Bungalow/Villa (3200 sq ft)");
  });

  it("adds a size suffix when the same BHK + unit type is listed more than once", () => {
    const rows = [
      row({ id: "a", bhk: "4 BHK", unitType: "Bungalow/Villa", size: "2500", sizeUnit: "sq ft" }),
      row({ id: "b", bhk: "4 BHK", unitType: "Bungalow/Villa", size: "3200", sizeUnit: "sq ft" }),
    ];

    expect(getAvailableSizeLabel(rows[0], rows)).toBe("4 BHK Bungalow/Villa (2500 sq ft)");
    expect(getAvailableSizeLabel(rows[1], rows)).toBe("4 BHK Bungalow/Villa (3200 sq ft)");
    expect(getAvailableSizeLabels(rows)).toEqual([
      "4 BHK Bungalow/Villa (2500 sq ft)",
      "4 BHK Bungalow/Villa (3200 sq ft)",
    ]);
  });
});

describe("lookupBhkCarParking", () => {
  it("finds parking stored under the disambiguated variant key", () => {
    const rows = [
      row({ id: "a", bhk: "4 BHK", unitType: "Flat/Apartment", size: "1800", sizeUnit: "sq ft" }),
      row({ id: "b", bhk: "4 BHK", unitType: "Flat/Apartment", size: "2100", sizeUnit: "sq ft" }),
    ];
    const parking = {
      "4 BHK Flat/Apartment (1800 sq ft)": {
        ...EMPTY_BHK_CAR_PARKING,
        available: true,
        count: "2",
      },
    };

    expect(lookupBhkCarParking(parking, rows[0], rows)?.count).toBe("2");
    expect(lookupBhkCarParking(parking, rows[1], rows)).toBeUndefined();
  });
});

describe("lookupBhkCharges", () => {
  it("finds charges stored under the disambiguated variant key", () => {
    const rows = [
      row({ id: "a", bhk: "4 BHK", unitType: "Flat/Apartment", size: "1800", sizeUnit: "sq ft" }),
      row({ id: "b", bhk: "4 BHK", unitType: "Flat/Apartment", size: "2100", sizeUnit: "sq ft" }),
    ];
    const charges = {
      "4 BHK Flat/Apartment (1800 sq ft)": { ...EMPTY_BHK_CHARGES, transferFee: "1000" },
    };

    expect(lookupBhkCharges(charges, rows[0], rows)?.transferFee).toBe("1000");
    expect(lookupBhkCharges(charges, rows[1], rows)).toBeUndefined();
  });
});

describe("getBhkAreaTabs", () => {
  it("returns distinct tab labels for repeated BHK sizes", () => {
    const project = {
      availableSizes: [
        row({ id: "a", bhk: "4 BHK", unitType: "Flat/Apartment", size: "1800", sizeUnit: "sq ft" }),
        row({ id: "b", bhk: "4 BHK", unitType: "Flat/Apartment", size: "2100", sizeUnit: "sq ft" }),
        row({ id: "c", bhk: "4 BHK", unitType: "Flat/Apartment", size: "2400", sizeUnit: "sq ft" }),
      ],
    } as ProjectDetailsValues;

    expect(getBhkAreaTabs(project, "residential", "flat-apartment").map((tab) => tab.label)).toEqual([
      "4 BHK (1800 sq ft)",
      "4 BHK (2100 sq ft)",
      "4 BHK (2400 sq ft)",
    ]);
  });
});
