jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./saved-properties.repository");
jest.mock("../../../landing/property-search/property-search.repository");
jest.mock("../../../landing/property-search/property-search.mapper", () => ({
  FORM_TYPE_BY_DB_TYPE: { residential: "residential" },
  toListing: jest.fn((card) => ({ id: card.id, title: card.title, imageUrl: "a.jpg" })),
  toGalleryImagePaths: jest.fn((media, mainImage) => [mainImage, ...media.map((m) => m.file_path)]),
}));

const repository = require("./saved-properties.repository");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const service = require("./saved-properties.service");

const USER_ID = "user-1";
const PROPERTY_ID = "p1";
const query = { page: 1, limit: 10 };

const buildRow = (overrides = {}) => ({
  id: "saved-1",
  property_id: PROPERTY_ID,
  created_at: new Date("2026-11-10T10:00:00Z"),
  status: "published",
  title: "2 BHK Flat",
  listing_number: "100001",
  listing_type: "sale",
  property_type: "residential",
  locality: "Indiranagar",
  city: "Bengaluru",
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe("saveProperty", () => {
  it("saves a published property of another user", async () => {
    repository.findPublishedProperty.mockResolvedValue({ id: PROPERTY_ID, user_id: "owner-1" });

    await expect(service.saveProperty(USER_ID, PROPERTY_ID)).resolves.toEqual({ saved: true });
    expect(repository.insertSaved).toHaveBeenCalledWith(USER_ID, PROPERTY_ID);
  });

  it("answers 404 when the property is unknown or unpublished", async () => {
    repository.findPublishedProperty.mockResolvedValue(undefined);

    await expect(service.saveProperty(USER_ID, PROPERTY_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repository.insertSaved).not.toHaveBeenCalled();
  });

  it("answers 400 for the user's own listing", async () => {
    repository.findPublishedProperty.mockResolvedValue({ id: PROPERTY_ID, user_id: USER_ID });

    await expect(service.saveProperty(USER_ID, PROPERTY_ID)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(repository.insertSaved).not.toHaveBeenCalled();
  });
});

describe("unsaveProperty", () => {
  it("removes the row scoped to the user and stays idempotent", async () => {
    repository.deleteSaved.mockResolvedValue(0);

    await expect(service.unsaveProperty(USER_ID, PROPERTY_ID)).resolves.toEqual({ saved: false });
    expect(repository.deleteSaved).toHaveBeenCalledWith(USER_ID, PROPERTY_ID);
  });
});

describe("listSavedPropertyIds", () => {
  it("wraps the saved ids", async () => {
    repository.findSavedIds.mockResolvedValue(["p1", "p2"]);

    await expect(service.listSavedPropertyIds(USER_ID)).resolves.toEqual({
      propertyIds: ["p1", "p2"],
    });
  });
});

describe("listSavedProperties", () => {
  function mockRows(rows) {
    repository.findSavedRows.mockResolvedValue(rows);
    repository.countSaved.mockResolvedValue(rows.length);
  }

  it("returns the search card with slider images for a published property", async () => {
    mockRows([buildRow()]);
    searchRepository.findCardsByPropertyIds.mockResolvedValue([
      { id: "p1", title: "Sky Heights", member_ids: ["p1", "p1b"] },
    ]);
    searchRepository.findCardExtras.mockResolvedValue({
      media: [
        { property_id: "p1b", file_path: "b.jpg" },
        { property_id: "other", file_path: "x.jpg" },
      ],
    });

    const result = await service.listSavedProperties(USER_ID, query);

    expect(result).toMatchObject({ page: 1, limit: 10, total: 1 });
    expect(result.items[0]).toMatchObject({
      id: "saved-1",
      propertyId: "p1",
      isAvailable: true,
      property: { id: "p1", title: "Sky Heights", imageUrls: ["a.jpg", "b.jpg"] },
    });
  });

  it("keeps a closed property listed with its basic details", async () => {
    mockRows([buildRow({ status: "closed" })]);

    const result = await service.listSavedProperties(USER_ID, query);

    expect(searchRepository.findCardsByPropertyIds).not.toHaveBeenCalled();
    expect(result.items[0]).toMatchObject({
      isAvailable: false,
      property: { id: "p1", title: "2 BHK Flat", city: "Bengaluru", propertyType: "residential" },
    });
  });

  it("returns an empty page without touching the search repository", async () => {
    mockRows([]);

    await expect(service.listSavedProperties(USER_ID, query)).resolves.toMatchObject({
      items: [],
      total: 0,
    });
    expect(searchRepository.findCardExtras).not.toHaveBeenCalled();
  });
});
