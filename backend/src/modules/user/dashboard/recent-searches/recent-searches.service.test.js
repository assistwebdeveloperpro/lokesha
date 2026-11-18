jest.mock("../../../../config/db", () => ({ db: {} }));
jest.mock("./recent-searches.repository");

const repository = require("./recent-searches.repository");
const service = require("./recent-searches.service");
const { buildCriteriaHash } = require("./recent-searches.criteria");

const USER_ID = "user-1";
const TRX = { name: "trx" };

const searchCriteria = {
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: ["Bopal"],
  projects: [],
  bedrooms: [],
  propertyTypes: [],
  more: {},
};
const payload = { searchCriteria, searchUrl: "/property-for-sale-in-ahmedabad" };
const hash = buildCriteriaHash(searchCriteria);

const buildGuestEntry = (overrides = {}) => ({
  ...payload,
  searchedAt: "2026-11-10T10:00:00.000Z",
  ...overrides,
});

const upsertedRows = () => repository.upsertSearches.mock.calls[0][1];

beforeEach(() => {
  jest.resetAllMocks();
  repository.runInTransaction.mockImplementation((callback) => callback(TRX));
});

describe("recordSearch", () => {
  it("upserts a generated row for the authenticated user and trims to 20", async () => {
    repository.upsertSearches.mockResolvedValue([
      {
        id: "s1",
        search_title: "t",
        search_subtitle: "Bopal, Ahmedabad",
        search_criteria: searchCriteria,
        search_url: payload.searchUrl,
        searched_at: new Date(),
      },
    ]);

    const item = await service.recordSearch(USER_ID, payload);

    expect(repository.lockUser).toHaveBeenCalledWith(TRX, USER_ID);
    expect(upsertedRows()).toEqual([
      expect.objectContaining({
        user_id: USER_ID,
        criteria_hash: hash,
        search_title: "Buy Residential property in Bopal, Ahmedabad",
        search_subtitle: "Bopal, Ahmedabad",
      }),
    ]);
    expect(repository.trimToLimit).toHaveBeenCalledWith(TRX, USER_ID, 20);
    expect(item).toMatchObject({ id: "s1", subtitle: "Bopal, Ahmedabad", searchUrl: payload.searchUrl });
  });

  it("uses the same hash for a repeat so the row is refreshed, not duplicated", async () => {
    repository.upsertSearches.mockResolvedValue([{ id: "s1" }]);

    await service.recordSearch(USER_ID, payload);
    await service.recordSearch(USER_ID, { ...payload, searchCriteria: { ...searchCriteria, localities: ["bopal"] } });

    const [first, second] = repository.upsertSearches.mock.calls.map(([, rows]) => rows[0].criteria_hash);
    expect(first).toBe(second);
  });

  it("propagates a repository failure", async () => {
    repository.upsertSearches.mockRejectedValue(new Error("db down"));

    await expect(service.recordSearch(USER_ID, payload)).rejects.toThrow("db down");
  });
});

describe("syncSearches", () => {
  it("does nothing when every entry is invalid", async () => {
    await expect(service.syncSearches(USER_ID, [{ junk: true }, null, "x"])).resolves.toEqual({ synced: 0 });
    expect(repository.runInTransaction).not.toHaveBeenCalled();
  });

  it("skips invalid entries and still stores the valid ones", async () => {
    repository.findExistingByHashes.mockResolvedValue([]);

    const result = await service.syncSearches(USER_ID, [{ junk: true }, buildGuestEntry()]);

    expect(result).toEqual({ synced: 1 });
    expect(upsertedRows()).toHaveLength(1);
  });

  it("collapses duplicate entries keeping the newest", async () => {
    repository.findExistingByHashes.mockResolvedValue([]);

    await service.syncSearches(USER_ID, [
      buildGuestEntry({ searchedAt: "2026-11-10T10:00:00.000Z" }),
      buildGuestEntry({ searchedAt: "2026-11-12T10:00:00.000Z" }),
    ]);

    expect(upsertedRows()).toHaveLength(1);
    expect(upsertedRows()[0].searched_at).toEqual(new Date("2026-11-12T10:00:00.000Z"));
  });

  it("keeps a newer stored timestamp and takes a newer guest one", async () => {
    repository.findExistingByHashes.mockResolvedValue([
      { criteria_hash: hash, searched_at: new Date("2026-11-15T10:00:00Z") },
    ]);

    await expect(service.syncSearches(USER_ID, [buildGuestEntry()])).resolves.toEqual({ synced: 0 });
    expect(repository.upsertSearches).not.toHaveBeenCalled();

    repository.findExistingByHashes.mockResolvedValue([
      { criteria_hash: hash, searched_at: new Date("2026-11-01T10:00:00Z") },
    ]);

    await expect(service.syncSearches(USER_ID, [buildGuestEntry()])).resolves.toEqual({ synced: 1 });
  });

  it("clamps future dates to now", async () => {
    repository.findExistingByHashes.mockResolvedValue([]);
    const before = Date.now();

    await service.syncSearches(USER_ID, [buildGuestEntry({ searchedAt: "2999-01-01T00:00:00.000Z" })]);

    const time = upsertedRows()[0].searched_at.getTime();
    expect(time).toBeGreaterThanOrEqual(before);
    expect(time).toBeLessThanOrEqual(Date.now());
  });

  it("caps the merge at 20 entries and trims the stored history", async () => {
    repository.findExistingByHashes.mockResolvedValue([]);
    const entries = Array.from({ length: 20 }, (_, index) =>
      buildGuestEntry({
        searchCriteria: { ...searchCriteria, localities: [`area-${index}`] },
        searchedAt: new Date(Date.UTC(2026, 10, 1, index)).toISOString(),
      })
    );

    await service.syncSearches(USER_ID, entries);

    expect(upsertedRows()).toHaveLength(20);
    expect(upsertedRows()[0].searched_at.getTime()).toBeGreaterThan(upsertedRows()[19].searched_at.getTime());
    expect(repository.trimToLimit).toHaveBeenCalledWith(TRX, USER_ID, 20);
  });

  it("takes the user id from the argument, never from an entry", async () => {
    repository.findExistingByHashes.mockResolvedValue([]);

    await service.syncSearches(USER_ID, [buildGuestEntry({ userId: "attacker" })]);

    expect(upsertedRows()[0].user_id).toBe(USER_ID);
  });
});

describe("listSearches", () => {
  it("maps rows to items with the total", async () => {
    repository.findSearches.mockResolvedValue([
      {
        id: "s1",
        search_title: "Buy Flat",
        search_subtitle: null,
        search_criteria: searchCriteria,
        search_url: "/x",
        searched_at: new Date("2026-11-10T10:00:00Z"),
      },
    ]);
    repository.countSearches.mockResolvedValue(1);

    const result = await service.listSearches(USER_ID, { limit: 20 });

    expect(repository.findSearches).toHaveBeenCalledWith(USER_ID, 20);
    expect(result).toEqual({
      items: [
        {
          id: "s1",
          title: "Buy Flat",
          subtitle: null,
          searchCriteria,
          searchUrl: "/x",
          searchedAt: new Date("2026-11-10T10:00:00Z"),
        },
      ],
      total: 1,
    });
  });
});

describe("deleteSearch", () => {
  it("deletes the search of the user", async () => {
    repository.deleteSearch.mockResolvedValue(1);

    await expect(service.deleteSearch(USER_ID, "s1")).resolves.toBeUndefined();
    expect(repository.deleteSearch).toHaveBeenCalledWith(USER_ID, "s1");
  });

  it("answers 404 for a missing or foreign search", async () => {
    repository.deleteSearch.mockResolvedValue(0);

    await expect(service.deleteSearch(USER_ID, "s2")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("clearSearches", () => {
  it("clears only the history of the user", async () => {
    await service.clearSearches(USER_ID);

    expect(repository.deleteAllSearches).toHaveBeenCalledWith(USER_ID);
  });
});
