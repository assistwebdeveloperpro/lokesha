const { toListing, toPropertyDetails } = require("./property-search.mapper");

const baseRow = {
  id: "p1",
  member_ids: ["p1"],
  listing_type: "rent-lease",
  property_type: "pg",
  sub_type_slug: "pg",
  sub_type_slugs: ["pg"],
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

  it("shows owner contact for staff listings and poster name for user listings", () => {
    expect(
      toListing(
        { ...baseRow, listed_by: "lokesha_staff", owner_contact_name: "  Raj Patel  ", poster_name: "Staff User" },
        extras
      ).listerName
    ).toBe("Raj Patel");
    expect(
      toListing({ ...baseRow, listed_by: "admin", owner_contact_name: null, poster_name: "Admin User" }, extras)
        .listerName
    ).toBeNull();
    expect(
      toListing(
        { ...baseRow, listed_by: "agent", posted_by: "agent", owner_contact_name: null, poster_name: "Asha Shah" },
        extras
      ).listerName
    ).toBe("Asha Shah");
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

describe("toListing facts", () => {
  const unitRow = {
    ...baseRow,
    listing_type: "sale",
    property_type: "residential",
    posted_by: "buyer_owner_tenant",
    price_min: "7100000",
    price_max: "7100000",
    area_min: "1000",
    area_unit: "sq-ft",
    total_floors: 12,
    floor_number: 7,
    furnishing_status: "furnished",
    age_of_construction: "gt-5",
    property_transaction: "resale",
  };

  it("maps the unit details of a single property", () => {
    const card = toListing(unitRow, extras);

    expect(card).toMatchObject({
      pricePerSqft: 7100,
      totalFloors: 12,
      floorNumber: 7,
      furnishingStatus: "furnished",
      ageOfConstruction: "gt-5",
      propertyTransaction: "resale",
    });
  });

  it("leaves missing unit details empty", () => {
    const card = toListing({ ...baseRow, listing_type: "sale", posted_by: "agent" }, extras);

    expect(card).toMatchObject({
      pricePerSqft: null,
      floorNumber: null,
      furnishingStatus: null,
      ageOfConstruction: null,
      propertyTransaction: null,
      launchDate: null,
      possessionDate: null,
    });
  });

  it.each([
    ["rent", { listing_type: "rent-lease" }],
    ["a non sq ft area", { area_unit: "sq-yd" }],
    ["a builder project", { builder_project_id: "b1" }],
    ["no area", { area_min: null }],
  ])("has no price per sq ft for %s", (_, override) => {
    expect(toListing({ ...unitRow, ...override }, extras).pricePerSqft).toBeNull();
  });

  it("keeps launch and possession dates apart for builder projects", () => {
    const card = toListing(
      {
        ...unitRow,
        builder_project_id: "b1",
        posted_by: "builder",
        launch_date: "2026-01-29T12:00:00Z",
        possession_date: "2034-12-15T12:00:00Z",
        total_units: 838,
      },
      extras
    );

    expect(card.launchDate).toBe("Jan 29, 2026");
    expect(card.possessionDate).toBe("Dec'2034");
    expect(card.totalUnits).toBe(838);
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
