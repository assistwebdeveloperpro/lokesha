jest.mock("../../../config/db", () => ({ db: {} }));
jest.mock("./property-search.repository");
jest.mock("../../shared/property/repositories/property-read.repository");

const repository = require("./property-search.repository");
const readRepository = require("../../shared/property/repositories/property-read.repository");
const { searchQuerySchema } = require("./property-search.validation");
const { searchProperties, getPropertyDetails } = require("./property-search.service");

const parse = (query) => searchQuerySchema.validate(query).value;

const row = {
  id: "p1",
  member_ids: ["p1"],
  listing_type: "sale",
  property_type: "residential",
  sub_type_slug: "flat-apartment",
  sub_type_name: "Flat/Apartment",
  title: "Sunrise",
  locality: "Bopal",
  city: "Ahmedabad",
  posted_by: "agent",
  price_min: "4500000",
  price_max: "4500000",
  bedrooms: [3],
};

beforeEach(() => {
  jest.resetAllMocks();
  repository.findCardExtras.mockResolvedValue({ media: [], variants: [], reraRows: [] });
});

describe("searchProperties", () => {
  it("returns the page with its total and no fallback when there are results", async () => {
    repository.countListings.mockResolvedValue(1);
    repository.findListings.mockResolvedValue([row]);

    const result = await searchProperties(parse({ listingType: "sale", category: "residential", city: "Ahmedabad" }));

    expect(result).toMatchObject({ page: 1, pageSize: 30, total: 1, otherLocalities: [] });
    expect(result.items[0]).toMatchObject({ id: "p1", postedBy: "dealer", price: 4500000, bedrooms: [3] });
    expect(repository.findListings).toHaveBeenCalledTimes(1);
  });

  it("offers other localities of the city when nothing matches", async () => {
    repository.countListings.mockResolvedValue(0);
    repository.findListings.mockResolvedValueOnce([]).mockResolvedValueOnce([row]);

    const result = await searchProperties(
      parse({ listingType: "sale", category: "residential", city: "Ahmedabad", localities: "Naroda" })
    );

    expect(result.items).toEqual([]);
    expect(result.otherLocalities).toHaveLength(1);
    expect(repository.findListings.mock.calls[1][1]).toMatchObject({ excludeLocalities: ["naroda"] });
  });

  it("shows no fallback when nothing matches and no city is given", async () => {
    repository.countListings.mockResolvedValue(0);
    repository.findListings.mockResolvedValue([]);

    const result = await searchProperties(parse({ listingType: "sale", category: "residential" }));

    expect(result.otherLocalities).toEqual([]);
    expect(repository.findListings).toHaveBeenCalledTimes(1);
  });
});

describe("getPropertyDetails", () => {
  it("answers 404 for a property that is not published", async () => {
    repository.findPublishedProperty.mockResolvedValue(undefined);

    await expect(getPropertyDetails("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  describe("similar listings", () => {
    const similarRow = { ...row, id: "p2", member_ids: ["p2"] };

    beforeEach(() => {
      repository.findPublishedProperty.mockResolvedValue({ ...row, listing_number: 101 });
      repository.findCard.mockResolvedValue(row);
      repository.findAmenityNames.mockResolvedValue([]);
      readRepository.findTypeRow.mockResolvedValue({});
      readRepository.findSaleDetails.mockResolvedValue({});
      readRepository.findSelections.mockResolvedValue([]);
      readRepository.findAmenities.mockResolvedValue([]);
      readRepository.findFloorPlans.mockResolvedValue([]);
    });

    it("returns same locality listings with the locality scope", async () => {
      repository.findListings.mockResolvedValue([similarRow]);

      const result = await getPropertyDetails("p1");

      expect(result.similarScope).toBe("locality");
      expect(result.similar).toHaveLength(1);
      expect(repository.findListings).toHaveBeenCalledTimes(1);
      expect(repository.findListings.mock.calls[0][0]).toMatchObject({ city: "Ahmedabad", localities: ["Bopal"] });
    });

    it("falls back to city listings when the locality has none", async () => {
      repository.findListings.mockResolvedValueOnce([]).mockResolvedValueOnce([similarRow]);

      const result = await getPropertyDetails("p1");

      expect(result.similarScope).toBe("city");
      expect(result.similar).toHaveLength(1);
      expect(repository.findListings).toHaveBeenCalledTimes(2);
      expect(repository.findListings.mock.calls[1][0].localities).toEqual([]);
    });
  });
});
