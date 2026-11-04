jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("../repositories/property-read.repository");

const readRepository = require("../repositories/property-read.repository");
const { listAmenityOptions, buildPropertyDetail } = require("./property-read.service");

describe("buildPropertyDetail owner contact", () => {
  const property = {
    id: "p1",
    listing_number: "100001",
    listing_type: "sale",
    property_type: "residential",
    sub_type_slug: "flat-apartment",
    status: "draft",
    title: "Flat",
    description: "Nice flat",
  };
  const ownerContact = { full_name: "Ramesh Patel", mobile_number: "9876543210" };

  beforeEach(() => {
    readRepository.findGroupSiblings.mockResolvedValue([]);
    readRepository.findTypeRow.mockResolvedValue({});
    readRepository.findSaleDetails.mockResolvedValue({});
    readRepository.findSelections.mockResolvedValue([]);
    readRepository.findAmenities.mockResolvedValue([]);
    readRepository.findMedia.mockResolvedValue([]);
    readRepository.findFloorPlans.mockResolvedValue([]);
    readRepository.findOwnerContact.mockResolvedValue(ownerContact);
  });

  it("includes the owner contact for staff and admin viewers", async () => {
    const detail = await buildPropertyDetail(property, "lokesha_staff", { includeOwnerContact: true });

    expect(readRepository.findOwnerContact).toHaveBeenCalledWith("p1");
    expect(detail.payload.ownerContact).toEqual({ fullName: "Ramesh Patel", mobileNumber: "9876543210" });
  });

  it("never reads the owner contact for other viewers", async () => {
    const detail = await buildPropertyDetail(property, "agent");

    expect(readRepository.findOwnerContact).not.toHaveBeenCalled();
    expect(detail.payload).not.toHaveProperty("ownerContact");
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
