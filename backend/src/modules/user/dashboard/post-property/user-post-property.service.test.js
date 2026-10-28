jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./user-post-property.repository");
jest.mock("../../../shared/property/repositories/property-read.repository");

const postPropertyRepository = require("./user-post-property.repository");
const readRepository = require("../../../shared/property/repositories/property-read.repository");
const { getMyProperty } = require("./user-post-property.service");

const user = { id: "user-1", role: "agent" };

describe("getMyProperty", () => {
  it("returns 404 when the property is not owned by the user", async () => {
    postPropertyRepository.findOwnedProperty.mockResolvedValue(undefined);

    await expect(getMyProperty(user, "p1")).rejects.toMatchObject({ statusCode: 404 });
    expect(postPropertyRepository.findOwnedProperty).toHaveBeenCalledWith("p1", "user-1");
  });

  it("loads only the tables the listing uses", async () => {
    postPropertyRepository.findOwnedProperty.mockResolvedValue({
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
    postPropertyRepository.findOwnedProperty.mockResolvedValue(row("p2", "100002", "pg"));
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
