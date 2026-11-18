import { beforeEach, describe, expect, it } from "vitest";
import type { PropertySearchCriteria } from "@/lib/property-search-url/searchUrl.types";
import { EMPTY_MORE_FILTERS } from "@/lib/property-search-url/moreFilters.types";
import {
  addGuestSearch,
  clearGuestSearches,
  GUEST_RECENT_SEARCHES_STORAGE_KEY,
  MAX_GUEST_RECENT_SEARCHES,
  readGuestSearches,
  removeGuestSearch,
  toGuestSearchEntry,
  toRecentSearch,
} from "./guestRecentSearches";

const buildCriteria = (overrides: Partial<PropertySearchCriteria> = {}): PropertySearchCriteria => ({
  transaction: "property-for-sale",
  category: "residential-real-estate",
  cityName: "Ahmedabad",
  localities: [],
  projects: [],
  bedrooms: [],
  propertyTypes: [],
  constructionStatuses: [],
  saleTypes: [],
  occupancies: [],
  genders: [],
  postedBy: [],
  more: { ...EMPTY_MORE_FILTERS },
  page: 1,
  ...overrides,
});

function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

let storage = createStorage();

beforeEach(() => {
  storage = createStorage();
});

describe("addGuestSearch", () => {
  it("stores the criteria without page together with a generated title and url", () => {
    addGuestSearch(buildCriteria({ page: 3, localities: ["Bopal"] }), new Date("2026-11-18T10:00:00.000Z"), storage);

    const [record] = readGuestSearches(storage);
    expect(record.searchCriteria).not.toHaveProperty("page");
    expect(record).toMatchObject({
      title: "Buy Residential property in Bopal, Ahmedabad",
      subtitle: "Bopal, Ahmedabad",
      searchedAt: "2026-11-18T10:00:00.000Z",
    });
    expect(record.searchUrl.startsWith("/")).toBe(true);
  });

  it("keeps the latest search first", () => {
    addGuestSearch(buildCriteria({ cityName: "Surat" }), new Date("2026-11-18T10:00:00.000Z"), storage);
    addGuestSearch(buildCriteria({ cityName: "Pune" }), new Date("2026-11-18T11:00:00.000Z"), storage);

    expect(readGuestSearches(storage).map(({ subtitle }) => subtitle)).toEqual(["Pune", "Surat"]);
  });

  it("moves a repeated search to the top without duplicating it", () => {
    addGuestSearch(buildCriteria({ localities: ["Bopal", "Gota"] }), new Date("2026-11-18T10:00:00.000Z"), storage);
    addGuestSearch(buildCriteria({ cityName: "Pune" }), new Date("2026-11-18T11:00:00.000Z"), storage);
    addGuestSearch(buildCriteria({ localities: ["Gota", "Bopal"], page: 2 }), new Date("2026-11-18T12:00:00.000Z"), storage);

    const records = readGuestSearches(storage);
    expect(records).toHaveLength(2);
    expect(records[0].searchedAt).toBe("2026-11-18T12:00:00.000Z");
  });

  it("keeps only the newest 20 searches", () => {
    for (let index = 0; index <= MAX_GUEST_RECENT_SEARCHES; index += 1) {
      addGuestSearch(
        buildCriteria({ localities: [`area-${index}`] }),
        new Date(Date.UTC(2026, 10, 1, index)),
        storage,
      );
    }

    const records = readGuestSearches(storage);
    expect(records).toHaveLength(MAX_GUEST_RECENT_SEARCHES);
    expect(records[0].searchCriteria.localities).toEqual([`area-${MAX_GUEST_RECENT_SEARCHES}`]);
    expect(records.some(({ searchCriteria }) => searchCriteria.localities[0] === "area-0")).toBe(false);
  });

  it("does nothing without storage", () => {
    expect(() => addGuestSearch(buildCriteria(), new Date(), null)).not.toThrow();
  });
});

describe("readGuestSearches", () => {
  it("returns nothing for corrupt json or a wrong shape", () => {
    expect(readGuestSearches(createStorage({ [GUEST_RECENT_SEARCHES_STORAGE_KEY]: "{oops" }))).toEqual([]);
    expect(readGuestSearches(createStorage({ [GUEST_RECENT_SEARCHES_STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
  });

  it("drops invalid entries and keeps valid ones", () => {
    addGuestSearch(buildCriteria(), new Date("2026-11-18T10:00:00.000Z"), storage);
    const [valid] = readGuestSearches(storage);
    const mixed = createStorage({
      [GUEST_RECENT_SEARCHES_STORAGE_KEY]: JSON.stringify([
        valid,
        { ...valid, key: "bad-url", searchUrl: "https://evil.com" },
        { ...valid, key: "bad-date", searchedAt: "yesterday" },
        { key: "no-criteria" },
        null,
      ]),
    });

    expect(readGuestSearches(mixed)).toEqual([valid]);
  });

  it("treats blocked storage as empty", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };

    expect(readGuestSearches(blocked)).toEqual([]);
    expect(() => addGuestSearch(buildCriteria(), new Date(), blocked)).not.toThrow();
    expect(() => clearGuestSearches(blocked)).not.toThrow();
  });
});

describe("removeGuestSearch and clearGuestSearches", () => {
  it("removes one search by key", () => {
    addGuestSearch(buildCriteria({ cityName: "Surat" }), new Date("2026-11-18T10:00:00.000Z"), storage);
    addGuestSearch(buildCriteria({ cityName: "Pune" }), new Date("2026-11-18T11:00:00.000Z"), storage);
    const [first] = readGuestSearches(storage);

    removeGuestSearch(first.key, storage);

    expect(readGuestSearches(storage).map(({ subtitle }) => subtitle)).toEqual(["Surat"]);
  });

  it("clears everything", () => {
    addGuestSearch(buildCriteria(), new Date(), storage);

    clearGuestSearches(storage);

    expect(readGuestSearches(storage)).toEqual([]);
  });
});

describe("mappers", () => {
  it("maps a record to the shared search shape and the sync entry", () => {
    addGuestSearch(buildCriteria(), new Date("2026-11-18T10:00:00.000Z"), storage);
    const [record] = readGuestSearches(storage);

    expect(toRecentSearch(record)).toMatchObject({ id: record.key, title: record.title });
    expect(toGuestSearchEntry(record)).toEqual({
      searchCriteria: record.searchCriteria,
      searchUrl: record.searchUrl,
      searchedAt: record.searchedAt,
    });
  });
});
