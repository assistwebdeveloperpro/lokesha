jest.mock("../../../config/db", () => ({ db: {} }));
jest.mock("./property-read.repository");

const readRepository = require("./property-read.repository");
const { listAmenityOptions, listMyProperties, getMyProperty } = require("./property-read.service");

const user = { id: "user-1", role: "agent" };

describe("listMyProperties", () => {
  it("maps the form property type to the database type and returns the page", async () => {
    readRepository.findListingsByUser.mockResolvedValue([
      {
        id: "p1",
        member_ids: ["p1"],
        listing_number: "100001",
        price_min: null,
        price_max: null,
        status: "draft",
        listing_type: "sale",
        property_type: "residential",
        sub_type_slugs: ["duplex"],
        sub_type_names: ["Duplex"],
      },
    ]);
    readRepository.countListingsByUser.mockResolvedValue(11);
    readRepository.findImagesByPropertyIds.mockResolvedValue([
      { property_id: "p1", category: "main-photo", file_path: "/img.jpg" },
    ]);

    const result = await listMyProperties(user, { page: 2, limit: 10, propertyType: "pg-co-living" });

    expect(readRepository.findListingsByUser).toHaveBeenCalledWith("user-1", expect.objectContaining({ propertyType: "pg" }));
    expect(readRepository.findImagesByPropertyIds).toHaveBeenCalledWith(["p1"]);
    expect(result).toMatchObject({ page: 2, limit: 10, total: 11 });
    expect(result.items[0]).toMatchObject({ id: "p1", price: null, mainImage: "/img.jpg" });
  });

  it("adds the rejection reason to rejected properties only", async () => {
    readRepository.findListingsByUser.mockResolvedValue([
      { id: "p1", member_ids: ["p1"], status: "rejected", listing_type: "sale", property_type: "residential", sub_type_slugs: ["duplex"], sub_type_names: ["Duplex"] },
      { id: "p2", member_ids: ["p2"], status: "pending", listing_type: "sale", property_type: "residential", sub_type_slugs: ["duplex"], sub_type_names: ["Duplex"] },
    ]);
    readRepository.countListingsByUser.mockResolvedValue(2);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);
    readRepository.findRejectionReasons.mockResolvedValue([{ property_id: "p1", reason: "Photos are blurry" }]);

    const result = await listMyProperties(user, { page: 1, limit: 10 });

    expect(readRepository.findRejectionReasons).toHaveBeenCalledWith(["p1"]);
    expect(result.items.map((item) => item.rejectionReason)).toEqual(["Photos are blurry", null]);
  });

  it("does not look up reasons when nothing is rejected", async () => {
    readRepository.findListingsByUser.mockResolvedValue([
      { id: "p2", member_ids: ["p2"], status: "pending", listing_type: "sale", property_type: "residential", sub_type_slugs: ["duplex"], sub_type_names: ["Duplex"] },
    ]);
    readRepository.countListingsByUser.mockResolvedValue(1);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);
    readRepository.findRejectionReasons.mockClear();

    await listMyProperties(user, { page: 1, limit: 10 });

    expect(readRepository.findRejectionReasons).not.toHaveBeenCalled();
  });

  it("leaves the property type filter empty when not given", async () => {
    readRepository.findListingsByUser.mockResolvedValue([]);
    readRepository.countListingsByUser.mockResolvedValue(0);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);

    await listMyProperties(user, { page: 1, limit: 10 });

    expect(readRepository.findListingsByUser.mock.calls[0][1].propertyType).toBeUndefined();
  });
});

describe("listAmenityOptions", () => {
  const query = { listingType: "sale", propertyType: "commercial", subType: "shop" };

  it("splits the options by kind and keeps the order", async () => {
    readRepository.findAmenityOptions.mockResolvedValue([
      { kind: "amenity", amenity_key: "lift", name: "Lift", image_path: "/assets/images/amenities/lift.svg" },
      { kind: "amenity", amenity_key: "cctv", name: "CCTV", image_path: "/assets/images/amenities/cctv.svg" },
      { kind: "furnishing", amenity_key: "tv", name: "TV", image_path: "/assets/images/furnishing/tv.svg" },
    ]);

    const result = await listAmenityOptions(query);

    expect(readRepository.findAmenityOptions).toHaveBeenCalledWith(query);
    expect(result.amenities).toEqual([
      { key: "lift", name: "Lift", imagePath: "/assets/images/amenities/lift.svg" },
      { key: "cctv", name: "CCTV", imagePath: "/assets/images/amenities/cctv.svg" },
    ]);
    expect(result.furnishing).toEqual([{ key: "tv", name: "TV", imagePath: "/assets/images/furnishing/tv.svg" }]);
  });

  it("returns empty lists when nothing is mapped", async () => {
    readRepository.findAmenityOptions.mockResolvedValue([]);

    await expect(listAmenityOptions(query)).resolves.toEqual({ amenities: [], furnishing: [] });
  });
});

describe("getMyProperty", () => {
  it("returns 404 when the property is not owned by the user", async () => {
    readRepository.findOwnedProperty.mockResolvedValue(undefined);

    await expect(getMyProperty(user, "p1")).rejects.toMatchObject({ statusCode: 404 });
    expect(readRepository.findOwnedProperty).toHaveBeenCalledWith("p1", "user-1");
  });

  it("loads only the tables the listing uses", async () => {
    readRepository.findOwnedProperty.mockResolvedValue({
      id: "p1",
      listing_number: "100001",
      price: null,
      listing_type: "rent-lease",
      property_type: "pg",
      sub_type_slug: "pg",
      status: "draft",
      builder_project_id: null,
      description: "d",
    });
    readRepository.findTypeRow.mockResolvedValue({ pg_name: "Sunrise", pg_gender: "male" });
    readRepository.findRentDetails.mockResolvedValue({ monthly_rent: "9000" });
    readRepository.findSelections.mockResolvedValue([]);
    readRepository.findAmenities.mockResolvedValue([]);
    readRepository.findMedia.mockResolvedValue([]);
    readRepository.findFloorPlans.mockResolvedValue([]);

    const result = await getMyProperty(user, "p1");

    expect(readRepository.findTypeRow).toHaveBeenCalledWith("pg", "p1");
    expect(readRepository.findSaleDetails).not.toHaveBeenCalled();
    expect(readRepository.findPlotDetails).not.toHaveBeenCalled();
    expect(readRepository.findProject).not.toHaveBeenCalled();
    expect(result.payload).toMatchObject({
      propertyType: "pg-co-living",
      listings: [{ propertySubType: "pg", details: { pgName: "Sunrise" }, pricing: { monthlyRent: 9000 } }],
    });
  });

  it("returns every sub type posted together with its own listing and files", async () => {
    const row = (id, number, slug) => ({
      id,
      listing_number: number,
      listing_group_id: "g1",
      price: null,
      listing_type: "rent-lease",
      property_type: "pg",
      sub_type_slug: slug,
      status: "draft",
      builder_project_id: null,
      description: "d",
    });
    readRepository.findOwnedProperty.mockResolvedValue(row("p2", "100002", "pg"));
    readRepository.findGroupSiblings.mockResolvedValue([row("p1", "100001", "pg")]);
    readRepository.findTypeRow.mockResolvedValue({});
    readRepository.findRentDetails.mockResolvedValue({});
    readRepository.findSelections.mockResolvedValue([]);
    readRepository.findAmenities.mockResolvedValue([]);
    readRepository.findMedia.mockImplementation(async (id) => [{ id: `m-${id}`, file_path: `/${id}.jpg` }]);
    readRepository.findFloorPlans.mockResolvedValue([]);

    const result = await getMyProperty(user, "p2");

    expect(result.property.id).toBe("p2");
    expect(result.payload.listings.map((listing) => listing.propertyId)).toEqual(["p1", "p2"]);
    expect(result.listingFiles.map((files) => files.propertyId)).toEqual(["p1", "p2"]);
    expect(result.listingFiles[0].media[0].path).toBe("/p1.jpg");
  });
});
