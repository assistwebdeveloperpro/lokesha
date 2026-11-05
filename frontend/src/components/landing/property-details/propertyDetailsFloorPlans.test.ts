import { describe, expect, it } from "vitest";
import { buildPropertyDetailsView, resolveFloorPlanVariant } from "./buildPropertyDetailsView";
import type { PublicPropertyDetails, PublicPropertyVariant } from "@/services/propertySearch.service";

function variant(
  patch: Partial<PublicPropertyVariant> & Pick<PublicPropertyVariant, "price">,
): PublicPropertyVariant {
  return {
    label: null,
    size: null,
    sizeUnit: null,
    unitsAvailable: null,
    ...patch,
  };
}

describe("resolveFloorPlanVariant", () => {
  const variants: PublicPropertyVariant[] = [
    variant({
      label: "4 BHK Bungalow/Villa (225 sq ft)",
      bhk: 4,
      size: "225",
      sizeUnit: "sq-ft",
      superBuiltUpArea: "225",
      superBuiltUpAreaUnit: "sq-ft",
      price: "7500000",
    }),
    variant({
      label: "4 BHK Bungalow/Villa (265 sq ft)",
      bhk: 4,
      size: "265",
      sizeUnit: "sq-ft",
      superBuiltUpArea: "265",
      superBuiltUpAreaUnit: "sq-ft",
      price: "8500000",
    }),
    variant({
      label: "4 BHK Bungalow/Villa (325 sq ft)",
      bhk: 4,
      size: "325",
      sizeUnit: "sq-ft",
      superBuiltUpArea: "325",
      superBuiltUpAreaUnit: "sq-ft",
      price: "9500000",
    }),
  ];

  it("matches repeated BHK variants by the size suffix in the floor plan label", () => {
    expect(resolveFloorPlanVariant(variants, "4 BHK Bungalow/Villa (265 sq ft)")?.price).toBe("8500000");
    expect(resolveFloorPlanVariant(variants, "4 BHK Bungalow/Villa (325 sq ft)")?.superBuiltUpArea).toBe("325");
  });

  it("does not reuse the first matching BHK when labels are disambiguated by size", () => {
    expect(resolveFloorPlanVariant(variants, "4 BHK Bungalow/Villa (265 sq ft)")?.price).not.toBe("7500000");
  });
});

describe("buildPropertyDetailsView floor plans", () => {
  it("shows area and price per floor plan variant", () => {
    const dto = {
      kind: "project",
      id: "p1",
      displayPropertyId: "1",
      listing: {
        title: "Shyam Kutir 86",
        propertyType: "residential",
        propertySubType: "bungalow-villa",
        bedrooms: [4],
        locality: "Test",
        city: "Ahmedabad",
        listingType: "sale",
        postedBy: "builder",
      },
      images: [],
      address: "Test address",
      description: "Test",
      facing: null,
      availableFrom: null,
      constructionStatus: null,
      possessionDate: null,
      amenities: [],
      attributes: {},
      pricing: {},
      selections: {},
      floorPlans: [
        { id: "fp1", path: "/a.png", label: "4 BHK Bungalow/Villa (265 sq ft)", planType: "3d" },
      ],
      brochure: null,
      poster: { name: "Builder", postedBy: "builder" },
      project: {
        projectName: "Shyam Kutir 86",
        projectType: null,
        developerName: "Dev",
        launchDate: null,
        totalUnits: null,
        totalBlocks: null,
        projectAreaAcres: null,
        reraLink: null,
        developerStats: { totalProjects: 0, ongoingProjects: 0, completedProjects: 0 },
        highlights: [],
        faqs: [],
      },
      variants: [
        variant({
          label: "4 BHK Bungalow/Villa (225 sq ft)",
          bhk: 4,
          superBuiltUpArea: "225",
          superBuiltUpAreaUnit: "sq-ft",
          price: "7500000",
        }),
        variant({
          label: "4 BHK Bungalow/Villa (265 sq ft)",
          bhk: 4,
          superBuiltUpArea: "265",
          superBuiltUpAreaUnit: "sq-ft",
          price: "8500000",
        }),
      ],
      similar: [],
    } as PublicPropertyDetails;

    const view = buildPropertyDetailsView(dto);
    if (view.kind !== "project") {
      throw new Error("expected project view");
    }

    expect(view.floorPlans[0]).toMatchObject({
      areaLabel: "265 sq ft",
      areaType: "Super Built-up Area",
      priceLabel: "₹85,00,000",
    });
  });
});
