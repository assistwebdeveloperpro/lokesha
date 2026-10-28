jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./manage-properties.repository");
jest.mock("../../../shared/property/repositories/property-read.repository");

const manageRepository = require("./manage-properties.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const { listMyProperties } = require("./manage-properties.service");

const user = { id: "user-1", role: "agent" };

describe("listMyProperties", () => {
  it("maps the form property type to the database type and returns the page", async () => {
    manageRepository.findListingsByUser.mockResolvedValue([
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
    manageRepository.countListingsByUser.mockResolvedValue(11);
    readRepository.findImagesByPropertyIds.mockResolvedValue([
      { property_id: "p1", category: "main-photo", file_path: "/img.jpg" },
    ]);

    const result = await listMyProperties(user, { page: 2, limit: 10, propertyType: "pg-co-living" });

    expect(manageRepository.findListingsByUser).toHaveBeenCalledWith("user-1", expect.objectContaining({ propertyType: "pg" }));
    expect(readRepository.findImagesByPropertyIds).toHaveBeenCalledWith(["p1"]);
    expect(result).toMatchObject({ page: 2, limit: 10, total: 11 });
    expect(result.items[0]).toMatchObject({ id: "p1", price: null, mainImage: "/img.jpg" });
  });

  it("adds the rejection reason to rejected properties only", async () => {
    manageRepository.findListingsByUser.mockResolvedValue([
      { id: "p1", member_ids: ["p1"], status: "rejected", listing_type: "sale", property_type: "residential", sub_type_slugs: ["duplex"], sub_type_names: ["Duplex"] },
      { id: "p2", member_ids: ["p2"], status: "pending", listing_type: "sale", property_type: "residential", sub_type_slugs: ["duplex"], sub_type_names: ["Duplex"] },
    ]);
    manageRepository.countListingsByUser.mockResolvedValue(2);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);
    manageRepository.findRejectionReasons.mockResolvedValue([{ property_id: "p1", reason: "Photos are blurry" }]);

    const result = await listMyProperties(user, { page: 1, limit: 10 });

    expect(manageRepository.findRejectionReasons).toHaveBeenCalledWith(["p1"]);
    expect(result.items.map((item) => item.rejectionReason)).toEqual(["Photos are blurry", null]);
  });

  it("does not look up reasons when nothing is rejected", async () => {
    manageRepository.findListingsByUser.mockResolvedValue([
      { id: "p2", member_ids: ["p2"], status: "pending", listing_type: "sale", property_type: "residential", sub_type_slugs: ["duplex"], sub_type_names: ["Duplex"] },
    ]);
    manageRepository.countListingsByUser.mockResolvedValue(1);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);
    manageRepository.findRejectionReasons.mockClear();

    await listMyProperties(user, { page: 1, limit: 10 });

    expect(manageRepository.findRejectionReasons).not.toHaveBeenCalled();
  });

  it("leaves the property type filter empty when not given", async () => {
    manageRepository.findListingsByUser.mockResolvedValue([]);
    manageRepository.countListingsByUser.mockResolvedValue(0);
    readRepository.findImagesByPropertyIds.mockResolvedValue([]);

    await listMyProperties(user, { page: 1, limit: 10 });

    expect(manageRepository.findListingsByUser.mock.calls[0][1].propertyType).toBeUndefined();
  });
});
