const { pickMainImage, toListItem, toPropertyDetail } = require("./property.mapper");
const { fromRow, TYPE_FIELDS, toRow } = require("./property-payload.fields");

const baseProperty = {
  id: "p1",
  listing_number: "100001",
  status: "draft",
  title: "3 BHK Flat/Apartment in Vesu",
  price: "6000000.00",
  listing_type: "sale",
  property_type: "residential",
  sub_type_slug: "flat-apartment",
  builder_project_id: null,
  project_name: "Sky Towers",
  locality: "Vesu",
  address_line_2: "Near park",
  pin_code: "395007",
  city: null,
  state: "Gujarat",
  description: "Nice flat",
  facing: "north-east",
  available_from: new Date(2027, 0, 5),
  construction_status: null,
  possession_date: null,
  created_at: new Date("2026-10-01T00:00:00Z"),
  updated_at: new Date("2026-10-02T00:00:00Z"),
  published_at: null,
};

const baseData = {
  property: baseProperty,
  role: "agent",
  typeRow: { property_id: "p1", bedrooms: 3, carpet_area: "1000.50", carpet_area_unit: "sq-ft", club_membership: false },
  plotDetails: null,
  saleDetails: { property_id: "p1", expected_price: "6000000.00", price_negotiable: true, rera_number: null },
  rentDetails: null,
  builderListing: null,
  specifications: [],
  selections: [{ option_group: "tenant_preference", option_key: "family" }],
  amenities: [
    { kind: "amenity", amenity_key: "lift" },
    { kind: "furnishing", amenity_key: "tv" },
  ],
  variants: [],
  media: [
    { id: "m1", file_path: "/uploads/properties/p1/a.jpg", category: "exterior", media_type: "image", original_name: "a.jpg", mime_type: "image/jpeg", file_size: 10 },
    { id: "m2", file_path: "/uploads/properties/p1/b.pdf", category: "brochure", media_type: "document", original_name: null, mime_type: "application/pdf", file_size: 20 },
  ],
  floorPlans: [
    { id: "f1", file_path: "/uploads/properties/p1/f.png", label: "Hall", plan_type: "2d", original_name: null, mime_type: "image/png", file_size: 5 },
  ],
  project: null,
  rejectionReason: null,
};

describe("pickMainImage", () => {
  it("prefers the main photo, then the first image", () => {
    const images = [
      { category: "exterior", file_path: "/a.jpg" },
      { category: "main-photo", file_path: "/b.jpg" },
    ];

    expect(pickMainImage(images)).toBe("/b.jpg");
    expect(pickMainImage([images[0]])).toBe("/a.jpg");
    expect(pickMainImage([])).toBeNull();
    expect(pickMainImage(undefined)).toBeNull();
  });
});

describe("toListItem", () => {
  it("maps the row and converts the form property type and numbers", () => {
    const item = toListItem(
      { ...baseProperty, property_type: "pg", sub_type_name: "PG", city: "Surat" },
      [{ category: "others", file_path: "/x.jpg" }]
    );

    expect(item).toMatchObject({
      id: "p1",
      listingNumber: 100001,
      price: 6000000,
      propertyType: "pg-co-living",
      subType: { slug: "flat-apartment", name: "PG" },
      city: "Surat",
      mainImage: "/x.jpg",
    });
  });
});

describe("fromRow", () => {
  it("is the inverse of toRow and drops nulls", () => {
    const row = toRow({ bedrooms: 2, carpetArea: 10.5, clubMembership: false });

    expect(fromRow({ ...row, floor_number: null }, TYPE_FIELDS.residential)).toEqual({
      bedrooms: 2,
      carpetArea: 10.5,
      clubMembership: false,
    });
  });

  it("formats dates and times", () => {
    expect(fromRow({ lease_contract_till: new Date(2027, 2, 9) }, TYPE_FIELDS.plot)).toEqual({
      leaseContractTill: "2027-03-09",
    });
    expect(fromRow({ entry_till: "22:30:00", pg_name: "A", pg_gender: "male" }, TYPE_FIELDS.pg)).toEqual({
      pgName: "A",
      pgGender: "male",
      entryTill: "22:30",
    });
  });

  it("returns an empty object without a row", () => {
    expect(fromRow(undefined, TYPE_FIELDS.residential)).toEqual({});
  });
});

describe("toPropertyDetail", () => {
  it("builds the payload in the complete request shape", () => {
    const { payload, property, media, floorPlans } = toPropertyDetail(baseData);
    const [listing] = payload.listings;

    expect(property).toMatchObject({ id: "p1", listingNumber: 100001, price: 6000000, rejectionReason: null });
    expect(payload).toMatchObject({
      listingType: "sale",
      propertyType: "residential",
      address: { projectName: "Sky Towers", locality: "Vesu", addressLine2: "Near park", pinCode: "395007", state: "Gujarat" },
    });
    expect(payload.address).not.toHaveProperty("city");
    expect(payload).not.toHaveProperty("project");
    expect(listing).toMatchObject({
      propertySubType: "flat-apartment",
      description: "Nice flat",
      facing: "north-east",
      availableFrom: "2027-01-05",
      details: { bedrooms: 3, carpetArea: 1000.5, carpetAreaUnit: "sq-ft", clubMembership: false },
      pricing: { expectedPrice: 6000000, priceNegotiable: true },
      selections: { tenantPreference: ["family"] },
      amenities: { amenities: ["lift"], furnishing: ["tv"] },
    });
    expect(listing.construction).toEqual({});
    expect(listing).not.toHaveProperty("plotDetails");
    expect(listing).not.toHaveProperty("variants");
    expect(media).toHaveLength(2);
    expect(floorPlans[0]).toMatchObject({ id: "f1", path: "/uploads/properties/p1/f.png", planType: "2d" });
  });

  it("splits the brochure from the photos in the payload files", () => {
    const { files } = toPropertyDetail(baseData).payload.listings[0];

    expect(files.media).toEqual([{ path: "/uploads/properties/p1/a.jpg", category: "exterior", originalName: "a.jpg" }]);
    expect(files.brochure).toEqual({ path: "/uploads/properties/p1/b.pdf" });
    expect(files.floorPlans).toEqual([{ path: "/uploads/properties/p1/f.png", label: "Hall", planType: "2d" }]);
  });

  it("maps rent listings and the rejection reason", () => {
    const data = {
      ...baseData,
      property: { ...baseProperty, listing_type: "rent-lease", status: "rejected" },
      saleDetails: null,
      rentDetails: { monthly_rent: "20000.00", notice_period_months: 2 },
      rejectionReason: "Photos are unclear",
    };

    const result = toPropertyDetail(data);

    expect(result.payload.listings[0].pricing).toEqual({ monthlyRent: 20000, noticePeriodMonths: 2 });
    expect(result.property.rejectionReason).toBe("Photos are unclear");
  });

  it("hides the rejection reason unless the listing is rejected", () => {
    expect(toPropertyDetail({ ...baseData, rejectionReason: "old" }).property.rejectionReason).toBeNull();
  });

  it("maps plot details for villa style sub types", () => {
    const data = {
      ...baseData,
      property: { ...baseProperty, sub_type_slug: "bungalow-villa" },
      plotDetails: { plot_area: "250.00", plot_area_unit: "sq-yd", floors_allowed: 2 },
    };

    expect(toPropertyDetail(data).payload.listings[0].plotDetails).toEqual({
      plotArea: 250,
      plotAreaUnit: "sq-yd",
      floorsAllowed: 2,
    });
  });

  it("maps builder listings with project, variants and specifications", () => {
    const data = {
      ...baseData,
      role: "lokesha_staff",
      property: { ...baseProperty, builder_project_id: "bp1" },
      project: {
        project_name: "Green Heights",
        total_units: 120,
        launch_date: new Date(2026, 5, 1),
        highlights: [
          { kind: "project-highlight", text: "Near metro" },
          { kind: "prime-location", text: "Airport", distance: "5 km" },
          { kind: "prime-location", text: "Mall", distance: null },
        ],
        faqs: [{ question: "Q?", answer: "A." }],
      },
      variants: [
        {
          label: "2 BHK",
          size: "1000.00",
          size_unit: "sq-ft",
          price: "4000000.00",
          typeRow: { bhk: 2 },
          charges: { car_parking_available: true, transfer_fee: null },
        },
        { label: "3 BHK", size: null, typeRow: { bhk: 3 }, charges: undefined },
      ],
      builderListing: { price_min: "4000000.00", conversion_status: null },
      specifications: [{ group_title: "Flooring", label: "Living", value: "Vitrified", is_custom: false }],
    };

    const { payload } = toPropertyDetail(data);
    const [listing] = payload.listings;

    expect(payload.postingAs).toBe("builder");
    expect(payload.project).toEqual({
      projectName: "Green Heights",
      totalUnits: 120,
      launchDate: "2026-06-01",
      highlights: [{ text: "Near metro" }],
      primeLocations: [{ text: "Airport", distance: "5 km" }, { text: "Mall" }],
      faqs: [{ question: "Q?", answer: "A." }],
    });
    expect(listing.variants).toEqual([
      {
        label: "2 BHK",
        size: 1000,
        sizeUnit: "sq-ft",
        price: 4000000,
        details: { bhk: 2 },
        charges: { carParkingAvailable: true },
      },
      { label: "3 BHK", details: { bhk: 3 } },
    ]);
    expect(listing.builder).toEqual({
      listing: { priceMin: 4000000 },
      specifications: [{ groupTitle: "Flooring", label: "Living", value: "Vitrified", isCustom: false }],
    });
  });

  it("does not set postingAs for builder role users", () => {
    const data = { ...baseData, role: "builder", property: { ...baseProperty, builder_project_id: "bp1" }, project: { project_name: "X", highlights: [], faqs: [] } };

    expect(toPropertyDetail(data).payload).not.toHaveProperty("postingAs");
  });
});
