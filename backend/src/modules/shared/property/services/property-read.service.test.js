jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("../repositories/property-read.repository");

const readRepository = require("../repositories/property-read.repository");
const { listAmenityOptions } = require("./property-read.service");

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
