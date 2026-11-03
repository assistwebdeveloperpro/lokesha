const { toListing, toPropertyDetails } = require("./property-search.mapper");

const baseRow = {
  id: "p1",
  member_ids: ["p1"],
  listing_type: "rent-lease",
  property_type: "pg",
  sub_type_slug: "pg",
  sub_type_name: "PG",
  title: "Sai PG",
  locality: "Vastrapur",
  city: "Ahmedabad",
  bedrooms: [],
  builder_project_id: null,
  rera_link: "",
};
const extras = { media: [], variants: [], reraRows: [] };

describe("toListing posted by", () => {
  it.each([
    ["buyer_owner_tenant", "owner"],
    ["agent", "dealer"],
    ["builder", "builder"],
  ])("shows %s as %s", (postedBy, label) => {
    expect(toListing({ ...baseRow, posted_by: postedBy }, extras).postedBy).toBe(label);
  });

  it("maps pg to the form property type", () => {
    expect(toListing({ ...baseRow, posted_by: "agent" }, extras).propertyType).toBe("pg-co-living");
  });
});

describe("toListing card", () => {
  it("merges unit sizes and photos of every sub type of a group", () => {
    const row = { ...baseRow, member_ids: ["p1", "p2"], property_type: "residential", bedrooms: [3], posted_by: "builder" };
    const card = toListing(row, {
      media: [
        { property_id: "p2", category: "main-photo", file_path: "/p2.jpg" },
        { property_id: "p9", category: "main-photo", file_path: "/other.jpg" },
      ],
      variants: [{ property_id: "p1", bhk: 2, carpet_area: "900", carpet_area_max: "1000" }],
      reraRows: [{ property_id: "p2" }],
    });

    expect(card.bedrooms).toEqual([2, 3]);
    expect(card.imageUrl).toBe("/p2.jpg");
    expect(card.carpetAreaMin).toBe(900);
    expect(card.carpetAreaMax).toBe(1000);
    expect(card.reraRegistered).toBe(true);
  });

  it("prefers the project name for builder listings", () => {
    const card = toListing({ ...baseRow, builder_project_id: "b1", project_name: "Praangan", posted_by: "builder" }, extras);
    expect(card.title).toBe("Praangan");
  });
});

describe("toPropertyDetails amenities", () => {
  const details = {
    property: { id: "p1", listing_number: 7 },
    listing: { postedBy: "owner" },
    project: null,
    media: [],
    amenityNames: [
      { kind: "amenity", amenity_key: "lift", name: "Lift", image_path: "/assets/images/amenities/lift.svg" },
      { kind: "furnishing", amenity_key: "tv", name: "TV", image_path: "/assets/images/furnishing/tv.svg" },
    ],
    amenities: [
      { kind: "amenity", amenity_key: "lift" },
      { kind: "amenity", amenity_key: "unknown" },
      { kind: "furnishing", amenity_key: "tv" },
    ],
    selections: [],
    floorPlans: [],
  };

  it("returns name and image path for each amenity and furnishing item", () => {
    const result = toPropertyDetails(details);

    expect(result.amenities).toEqual([{ name: "Lift", imagePath: "/assets/images/amenities/lift.svg" }]);
    expect(result.furnishingItems).toEqual([{ name: "TV", imagePath: "/assets/images/furnishing/tv.svg" }]);
  });
});
