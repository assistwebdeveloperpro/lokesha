import { beforeEach, describe, expect, it } from "vitest";
import {
  addGuestView,
  clearGuestHistory,
  GUEST_SEEN_STORAGE_KEY,
  MAX_GUEST_SEEN_PROPERTIES,
  readGuestHistory,
} from "./guestSeenHistory";

const idFor = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

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

describe("addGuestView", () => {
  it("stores the property id with its viewed timestamp", () => {
    addGuestView(idFor(1), new Date("2026-11-17T10:30:00.000Z"), storage);

    expect(readGuestHistory(storage)).toEqual([
      { propertyId: idFor(1), viewedAt: "2026-11-17T10:30:00.000Z" },
    ]);
  });

  it("keeps the latest view first", () => {
    addGuestView(idFor(1), new Date("2026-11-17T10:00:00.000Z"), storage);
    addGuestView(idFor(2), new Date("2026-11-17T11:00:00.000Z"), storage);

    expect(readGuestHistory(storage).map(({ propertyId }) => propertyId)).toEqual([idFor(2), idFor(1)]);
  });

  it("updates the timestamp instead of duplicating a property", () => {
    addGuestView(idFor(1), new Date("2026-11-17T10:00:00.000Z"), storage);
    addGuestView(idFor(2), new Date("2026-11-17T11:00:00.000Z"), storage);
    addGuestView(idFor(1), new Date("2026-11-17T12:00:00.000Z"), storage);

    expect(readGuestHistory(storage)).toEqual([
      { propertyId: idFor(1), viewedAt: "2026-11-17T12:00:00.000Z" },
      { propertyId: idFor(2), viewedAt: "2026-11-17T11:00:00.000Z" },
    ]);
  });

  it("keeps only the latest 50 properties", () => {
    for (let index = 0; index <= MAX_GUEST_SEEN_PROPERTIES; index += 1) {
      addGuestView(idFor(index), new Date(Date.UTC(2026, 10, 17, 0, index)), storage);
    }

    const ids = readGuestHistory(storage).map(({ propertyId }) => propertyId);
    expect(ids).toHaveLength(MAX_GUEST_SEEN_PROPERTIES);
    expect(ids[0]).toBe(idFor(MAX_GUEST_SEEN_PROPERTIES));
    expect(ids).not.toContain(idFor(0));
  });

  it("ignores a malformed property id", () => {
    addGuestView("not-an-id", new Date(), storage);

    expect(readGuestHistory(storage)).toEqual([]);
  });

  it("does not throw when storage is unavailable or full", () => {
    const failing = { ...storage, setItem: () => { throw new Error("quota"); } };

    expect(() => addGuestView(idFor(1), new Date(), failing)).not.toThrow();
    expect(() => addGuestView(idFor(1), new Date(), null)).not.toThrow();
  });
});

describe("readGuestHistory", () => {
  it("returns an empty list for corrupted JSON", () => {
    storage.setItem(GUEST_SEEN_STORAGE_KEY, "{broken");

    expect(readGuestHistory(storage)).toEqual([]);
  });

  it("returns an empty list when the stored value is not an array", () => {
    storage.setItem(GUEST_SEEN_STORAGE_KEY, JSON.stringify({ propertyId: idFor(1) }));

    expect(readGuestHistory(storage)).toEqual([]);
  });

  it("drops invalid entries and keeps the valid ones", () => {
    storage.setItem(
      GUEST_SEEN_STORAGE_KEY,
      JSON.stringify([
        { propertyId: idFor(1), viewedAt: "2026-11-17T10:00:00.000Z" },
        { propertyId: "bad", viewedAt: "2026-11-17T10:00:00.000Z" },
        { propertyId: idFor(2), viewedAt: "yesterday" },
        null,
      ]),
    );

    expect(readGuestHistory(storage)).toEqual([
      { propertyId: idFor(1), viewedAt: "2026-11-17T10:00:00.000Z" },
    ]);
  });

  it("returns an empty list when storage is unavailable", () => {
    expect(readGuestHistory(null)).toEqual([]);
  });
});

describe("clearGuestHistory", () => {
  it("removes the stored history", () => {
    addGuestView(idFor(1), new Date(), storage);

    clearGuestHistory(storage);

    expect(readGuestHistory(storage)).toEqual([]);
  });
});
