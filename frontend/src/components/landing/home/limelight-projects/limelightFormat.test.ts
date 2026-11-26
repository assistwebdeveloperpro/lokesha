import { describe, expect, it } from "vitest";
import type { LimelightProject } from "@/services/limelightProjects.service";
import { buildLimelightDetails, formatLimelightLocation } from "./limelightFormat";

const project = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Shyam Kutir 86",
  categoryLabel: "4 BHK Bungalow",
  bedrooms: [4],
  carpetAreaMin: 258,
  carpetAreaMax: 409,
  carpetAreaUnit: "sq-yd",
  totalUnits: 86,
  projectAreaAcres: 11000,
  locality: "Hathijan",
  city: "Ahmedabad",
} as LimelightProject;

describe("buildLimelightDetails", () => {
  it("builds the four detail items in order", () => {
    expect(buildLimelightDetails(project)).toEqual([
      { label: "Configuration", value: "4 BHK Bungalow" },
      { label: "Project Size", value: "86 Units" },
      { label: "Size", value: "258 sq yd - 409 sq yd" },
      { label: "Project Area", value: "11,000 Acres" },
    ]);
  });

  it("uses a dash for missing values", () => {
    const details = buildLimelightDetails({
      ...project,
      categoryLabel: "",
      totalUnits: null,
      projectAreaAcres: null,
      carpetAreaMin: null,
      carpetAreaMax: null,
    });

    expect(details.map(({ value }) => value)).toEqual(["—", "—", "—", "—"]);
  });

  it("uses singular units", () => {
    const details = buildLimelightDetails({ ...project, totalUnits: 1, projectAreaAcres: 1 });

    expect(details[1].value).toBe("1 Unit");
    expect(details[3].value).toBe("1 Acre");
  });
});

describe("formatLimelightLocation", () => {
  it("joins the parts that exist", () => {
    expect(formatLimelightLocation(project)).toBe("Hathijan, Ahmedabad");
    expect(formatLimelightLocation({ ...project, locality: "" })).toBe("Ahmedabad");
  });
});
