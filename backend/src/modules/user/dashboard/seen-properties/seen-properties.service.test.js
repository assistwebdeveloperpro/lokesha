jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./seen-properties.repository");
jest.mock("../../../landing/property-search/property-search.repository");
jest.mock("../../../landing/property-search/property-search.mapper", () => ({
  FORM_TYPE_BY_DB_TYPE: { residential: "residential" },
  toListing: jest.fn((card) => ({ id: card.id, title: card.title, imageUrl: "a.jpg" })),
  toGalleryImagePaths: jest.fn((media, mainImage) => [mainImage, ...media.map((m) => m.file_path)]),
}));

const repository = require("./seen-properties.repository");
const searchRepository = require("../../../landing/property-search/property-search.repository");
const service = require("./seen-properties.service");

const USER_ID = "user-1";
const PROPERTY_ID = "p1";
const TRX = { name: "trx" };
const query = { page: 1, limit: 20 };

const buildRow = (overrides = {}) => ({
  id: "view-1",
  property_id: PROPERTY_ID,
  viewed_at: new Date("2026-11-10T10:00:00Z"),
  status: "published",
  title: "2 BHK Flat",
  listing_number: "100001",
  listing_type: "sale",
  property_type: "residential",
  locality: "Indiranagar",
  city: "Bengaluru",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  repository.runInTransaction.mockImplementation((callback) => callback(TRX));
});

describe("recordView", () => {
  it("records nothing for a guest", async () => {
    await expect(service.recordView(undefined, PROPERTY_ID)).resolves.toEqual({ recorded: false });
    expect(repository.findPublishedProperty).not.toHaveBeenCalled();
    expect(repository.upsertViews).not.toHaveBeenCalled();
  });

  it("upserts the view of the authenticated user and trims to 50", async () => {
    repository.findPublishedProperty.mockResolvedValue({ id: PROPERTY_ID, user_id: "owner-1" });

    await expect(service.recordView(USER_ID, PROPERTY_ID)).resolves.toEqual({ recorded: true });

    expect(repository.lockUser).toHaveBeenCalledWith(TRX, USER_ID);
    expect(repository.upsertViews).toHaveBeenCalledWith(TRX, [
      expect.objectContaining({ user_id: USER_ID, property_id: PROPERTY_ID }),
    ]);
    expect(repository.trimToLimit).toHaveBeenCalledWith(TRX, USER_ID, 50);
  });

  it("answers 404 when the property is unknown or unpublished", async () => {
    repository.findPublishedProperty.mockResolvedValue(undefined);

    await expect(service.recordView(USER_ID, PROPERTY_ID)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repository.upsertViews).not.toHaveBeenCalled();
  });

  it("skips the user's own listing", async () => {
    repository.findPublishedProperty.mockResolvedValue({ id: PROPERTY_ID, user_id: USER_ID });

    await expect(service.recordView(USER_ID, PROPERTY_ID)).resolves.toEqual({ recorded: false });
    expect(repository.upsertViews).not.toHaveBeenCalled();
  });
});

describe("syncViews", () => {
  const entry = (propertyId, viewedAt) => ({ propertyId, viewedAt: new Date(viewedAt) });

  it("merges guest history into the user's history", async () => {
    repository.findPublishedProperties.mockResolvedValue([
      { id: "p1", user_id: "owner-1" },
      { id: "p2", user_id: "owner-1" },
    ]);
    repository.findExistingViews.mockResolvedValue([]);

    const result = await service.syncViews(USER_ID, [
      entry("p1", "2026-11-10T10:00:00Z"),
      entry("p2", "2026-11-10T11:00:00Z"),
    ]);

    expect(result).toEqual({ synced: 2 });
    expect(repository.lockUser).toHaveBeenCalledWith(TRX, USER_ID);
    expect(repository.upsertViews).toHaveBeenCalledWith(TRX, [
      expect.objectContaining({ user_id: USER_ID, property_id: "p2" }),
      expect.objectContaining({ user_id: USER_ID, property_id: "p1" }),
    ]);
    expect(repository.trimToLimit).toHaveBeenCalledWith(TRX, USER_ID, 50);
  });

  it("keeps the newer stored timestamp over an older guest one", async () => {
    repository.findPublishedProperties.mockResolvedValue([{ id: "p1", user_id: "owner-1" }]);
    repository.findExistingViews.mockResolvedValue([
      { property_id: "p1", viewed_at: new Date("2026-11-12T10:00:00Z") },
    ]);

    await expect(
      service.syncViews(USER_ID, [entry("p1", "2026-11-10T10:00:00Z")])
    ).resolves.toEqual({ synced: 0 });
    expect(repository.upsertViews).not.toHaveBeenCalled();
  });

  it("replaces an older stored timestamp with a newer guest one", async () => {
    repository.findPublishedProperties.mockResolvedValue([{ id: "p1", user_id: "owner-1" }]);
    repository.findExistingViews.mockResolvedValue([
      { property_id: "p1", viewed_at: new Date("2026-11-09T10:00:00Z") },
    ]);

    await service.syncViews(USER_ID, [entry("p1", "2026-11-10T10:00:00Z")]);

    expect(repository.upsertViews).toHaveBeenCalledWith(TRX, [
      expect.objectContaining({ property_id: "p1", viewed_at: new Date("2026-11-10T10:00:00Z") }),
    ]);
  });

  it("keeps the newest timestamp of duplicate guest entries", async () => {
    repository.findPublishedProperties.mockResolvedValue([{ id: "p1", user_id: "owner-1" }]);
    repository.findExistingViews.mockResolvedValue([]);

    await service.syncViews(USER_ID, [
      entry("p1", "2026-11-10T10:00:00Z"),
      entry("p1", "2026-11-10T12:00:00Z"),
    ]);

    expect(repository.upsertViews).toHaveBeenCalledWith(TRX, [
      expect.objectContaining({ viewed_at: new Date("2026-11-10T12:00:00Z") }),
    ]);
  });

  it("clamps future timestamps to now", async () => {
    repository.findPublishedProperties.mockResolvedValue([{ id: "p1", user_id: "owner-1" }]);
    repository.findExistingViews.mockResolvedValue([]);
    const before = Date.now();

    await service.syncViews(USER_ID, [entry("p1", "2999-01-01T00:00:00Z")]);

    const [, [row]] = repository.upsertViews.mock.calls[0];
    expect(row.viewed_at.getTime()).toBeGreaterThanOrEqual(before);
    expect(row.viewed_at.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("ignores unknown, unpublished and own properties", async () => {
    repository.findPublishedProperties.mockResolvedValue([
      { id: "p1", user_id: USER_ID },
      { id: "p2", user_id: "owner-1" },
    ]);
    repository.findExistingViews.mockResolvedValue([]);

    const result = await service.syncViews(USER_ID, [
      entry("p1", "2026-11-10T10:00:00Z"),
      entry("p2", "2026-11-10T10:00:00Z"),
      entry("missing", "2026-11-10T10:00:00Z"),
    ]);

    expect(result).toEqual({ synced: 1 });
    expect(repository.upsertViews).toHaveBeenCalledWith(TRX, [
      expect.objectContaining({ property_id: "p2" }),
    ]);
  });

  it("succeeds without a transaction when nothing is eligible", async () => {
    repository.findPublishedProperties.mockResolvedValue([]);

    await expect(
      service.syncViews(USER_ID, [entry("missing", "2026-11-10T10:00:00Z")])
    ).resolves.toEqual({ synced: 0 });
    expect(repository.runInTransaction).not.toHaveBeenCalled();
  });

  it("keeps only the 50 newest guest entries", async () => {
    const entries = Array.from({ length: 60 }, (_, index) =>
      entry(`p${index}`, new Date(Date.UTC(2026, 10, 1, 0, index)).toISOString())
    );
    repository.findPublishedProperties.mockImplementation(async (ids) =>
      ids.map((id) => ({ id, user_id: "owner-1" }))
    );
    repository.findExistingViews.mockResolvedValue([]);

    await service.syncViews(USER_ID, entries);

    const [requestedIds] = repository.findPublishedProperties.mock.calls[0];
    expect(requestedIds).toHaveLength(50);
    expect(requestedIds).toContain("p59");
    expect(requestedIds).not.toContain("p0");
  });
});

describe("listViewedProperties", () => {
  function mockRows(rows) {
    repository.findViewedRows.mockResolvedValue(rows);
    repository.countViewed.mockResolvedValue(rows.length);
  }

  it("returns the search card with slider images in the repository order", async () => {
    mockRows([buildRow()]);
    searchRepository.findCardsByPropertyIds.mockResolvedValue([
      { id: "p1", title: "Sky Heights", member_ids: ["p1", "p1b"] },
    ]);
    searchRepository.findCardExtras.mockResolvedValue({
      media: [{ property_id: "p1b", file_path: "b.jpg" }],
    });

    const result = await service.listViewedProperties(USER_ID, query);

    expect(repository.findViewedRows).toHaveBeenCalledWith(USER_ID, query);
    expect(result).toMatchObject({ page: 1, limit: 20, total: 1 });
    expect(result.items[0]).toMatchObject({
      id: "view-1",
      propertyId: "p1",
      isAvailable: true,
      property: { id: "p1", title: "Sky Heights", imageUrls: ["a.jpg", "b.jpg"] },
    });
  });

  it("returns an empty page without touching the search repository", async () => {
    mockRows([]);

    await expect(service.listViewedProperties(USER_ID, query)).resolves.toMatchObject({
      items: [],
      total: 0,
    });
    expect(searchRepository.findCardExtras).not.toHaveBeenCalled();
  });
});
